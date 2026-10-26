// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import path from 'path';
import os from 'os';
import { rmdirRecursive, lowerCaseCompare, lowerCaseCompareLists, lowerCaseStartsWith, readJsonFile, writeJsonFile, safeMkdir, safeUnlink, executeCmd, findRecursive } from './utils';
import * as constants from './constants';
import { ScopeType } from './models';
import { get, set, flatten, uniq, concat, Dictionary, groupBy, keys, difference } from 'lodash';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';

export interface SchemaConfiguration {
    references: SchemaReference[];
    temporaryPath: string;
    relativePath: string;
}

export interface SchemaReference {
    scope: ScopeType;
    reference: string;
}

interface RootSchemaConfiguration {
    file: string;
    jsonPath: string;
}

const RootSchemaConfigs: Map<ScopeType, RootSchemaConfiguration> = new Map([
    [ScopeType.Tenant, constants.tenantRootSchema],
    [ScopeType.Subscription, constants.subscriptionRootSchema],
    [ScopeType.ResourceGroup, constants.resourceGroupRootSchema],
    [ScopeType.ManagementGroup, constants.managementGroupRootSchema]
]);

export async function getCsharpGeneratorProviderNamespaces(): Promise<string[]> {
    const indexPath = path.resolve(constants.repoRoot, 'bicep-types-az/generated/index.json');
    const index = await readJsonFile(indexPath) as { resources: Record<string, unknown> };

    return uniq(Object.keys(index.resources).map(resourceType => resourceType.split('/')[0])).sort(lowerCaseCompare);
}

export async function generateSchemasWithCsharpGenerator(providerNamespace: string): Promise<SchemaConfiguration[]> {
    const available = await getCsharpGeneratorProviderNamespaces();
    const namespace = available.find(value => value.toLowerCase() === providerNamespace.toLowerCase());
    if (!namespace) {
        throw new Error(`Provider namespace '${providerNamespace}' has no pre-built Bicep types.`);
    }

    const tmpFolder = path.join(os.tmpdir(), Math.random().toString(36).substr(2));
    const bicepTypesGeneratedFolder = path.resolve(constants.repoRoot, 'bicep-types-az/generated');
    const csharpGeneratorExe = path.resolve(constants.repoRoot, 'src/TemplateSchemaGenerator/bin/Release/net10.0/publish/TemplateSchemaGenerator');
    const schemaConfigs: SchemaConfiguration[] = [];

    console.log(`Running C# generator for namespace: ${namespace}`);

    try {
        await mkdir(tmpFolder, { recursive: true });
        await executeCmd(constants.repoRoot, csharpGeneratorExe, [
            '--source-folder', bicepTypesGeneratedFolder,
            '--output-folder', tmpFolder,
            '--provider-namespace', namespace,
            '--no-update-root-schemas'
        ]);

        const namespaceLower = namespace.toLowerCase();
        const schemaFiles = await findRecursive(tmpFolder, p =>
            path.basename(p).toLowerCase() === `${namespaceLower}.json` ||
            (namespaceLower === 'microsoft.compute' && path.basename(p).toLowerCase() === 'microsoft.compute.extensions.json'));
        for (const schemaFilePath of schemaFiles) {
            const relativePath = path.relative(tmpFolder, schemaFilePath).replace(/\\/g, '/');
            const schema = await readJsonFile(schemaFilePath);
            const references: SchemaReference[] = [
                ...getSchemaRefs(schema, ScopeType.Tenant, 'tenant_resourceDefinitions'),
                ...getSchemaRefs(schema, ScopeType.ManagementGroup, 'managementGroup_resourceDefinitions'),
                ...getSchemaRefs(schema, ScopeType.Subscription, 'subscription_resourceDefinitions'),
                ...getSchemaRefs(schema, ScopeType.ResourceGroup, 'resourceDefinitions'),
                // Unknown scopes are included in every root schema to avoid false negatives.
                ...getSchemaRefs(schema, ScopeType.Tenant, 'unknown_resourceDefinitions'),
                ...getSchemaRefs(schema, ScopeType.ManagementGroup, 'unknown_resourceDefinitions'),
                ...getSchemaRefs(schema, ScopeType.Subscription, 'unknown_resourceDefinitions'),
                ...getSchemaRefs(schema, ScopeType.ResourceGroup, 'unknown_resourceDefinitions'),
            ];

            schemaConfigs.push({ references, temporaryPath: schemaFilePath, relativePath });
        }

        for (const schemaConfig of schemaConfigs) {
            await saveSchemaFile(schemaConfig);
        }
    }
    finally {
        await rmdirRecursive(tmpFolder);
    }

    console.log(`C# generator produced ${schemaConfigs.length} schema file(s) for ${namespace}`);
    return schemaConfigs;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSchemaRefs(output: any, scopeType: ScopeType, resourceDefinitionsPath: string): SchemaReference[] {
    const resourceDefs = output[resourceDefinitionsPath] || {};
    return Object.keys(resourceDefs).map(r => ({
        scope: scopeType,
        reference: `${resourceDefinitionsPath}/${r}`,
    }));
}

function getFilePathFromRef(schemaRef: string) {
    const schemaUri = schemaRef.split('#')[0];
    if (!lowerCaseStartsWith(schemaUri, constants.schemasBaseUri)) {
        throw new Error(`Unrecognized schema reference ${schemaRef}`);
    }
    return path.resolve(path.join(constants.schemasBasePath, schemaUri.substring(constants.schemasBaseUri.length + 1)));
}

async function saveSchemaFile(schemaConfig: SchemaConfiguration) {
    const schemaPath = path.join(constants.schemasBasePath, schemaConfig.relativePath);
    await safeMkdir(path.dirname(schemaPath));
    const output = await readJsonFile(schemaConfig.temporaryPath);
    output.id = `${constants.schemasBaseUri}/${schemaConfig.relativePath}#`;
    await writeJsonFile(schemaPath, output);
}

function schemaRefComparer(schemaRefA: string, schemaRefB: string) {
    const splitA = schemaRefA.substr(constants.schemasBaseUri.length + 1).split('/');
    const splitB = schemaRefB.substr(constants.schemasBaseUri.length + 1).split('/');
    return lowerCaseCompareLists(
        [...splitA.slice(1, 2), ...splitA.slice(0, 1), ...splitA.slice(2)],
        [...splitB.slice(1, 2), ...splitB.slice(0, 1), ...splitB.slice(2)]
    );
}

async function getCurrentTemplateRefs(rootSchemaConfig: RootSchemaConfiguration) {
    const current = await readJsonFile(rootSchemaConfig.file);
    const currentRefsOneOf = get(current, rootSchemaConfig.jsonPath) as Dictionary<string>[];
    return currentRefsOneOf.map(v => v['$ref']);
}

export async function clearAutoGeneratedSchemaRefs(providers: { namespace: string }[]) {
    for (const rootSchemaConfig of RootSchemaConfigs.values()) {
        const currentRefs = await getCurrentTemplateRefs(rootSchemaConfig);
        const schemasToRemove = [];
        const schemasByFilePath = groupBy(currentRefs, getFilePathFromRef);
        for (const schemaFile of keys(schemasByFilePath)) {
            const fileName = path.basename(schemaFile).toLowerCase();
            let matchesProvider = providers.some(entry => fileName === `${entry.namespace.toLowerCase()}.json`);
            if (!matchesProvider && providers.some(entry => fileName.startsWith(`${entry.namespace.toLowerCase()}.`))) {
                const schema = existsSync(schemaFile) ? await readJsonFile(schemaFile) : undefined;
                const resourceDefinitions = Object.entries(schema ?? {})
                    .filter(([name]) => name.endsWith('resourceDefinitions'))
                    .flatMap(([, definitions]) => Object.values(definitions as Dictionary<unknown>));
                matchesProvider = schema === undefined || resourceDefinitions.some(definition =>
                    (get(definition, 'properties.type.enum', []) as string[])
                        .some(type => providers.some(entry => lowerCaseStartsWith(type, `${entry.namespace}/`))));
            }
            if (matchesProvider) {
                schemasToRemove.push(...schemasByFilePath[schemaFile]);
                await safeUnlink(schemaFile);
            }
        }
        const newRefs = difference(currentRefs, schemasToRemove);
        const template = await readJsonFile(rootSchemaConfig.file);
        set(template, rootSchemaConfig.jsonPath, newRefs.map(ref => ({ '$ref': ref })));
        await writeJsonFile(rootSchemaConfig.file, template);
    }
}

export async function saveAutoGeneratedSchemaRefs(schemaConfigs: SchemaConfiguration[]) {
    for (const [scopeType, rootSchemaConfig] of RootSchemaConfigs) {
        const refs = flatten(schemaConfigs
            .map(c => c.references
                .filter(x => x.scope & scopeType)
                .map(x => `${constants.schemasBaseUri}/${c.relativePath}#/${x.reference}`)));
        const currentRefs = await getCurrentTemplateRefs(rootSchemaConfig);
        const newRefs = uniq(concat(currentRefs, refs)).sort(schemaRefComparer);
        const template = await readJsonFile(rootSchemaConfig.file);
        set(template, rootSchemaConfig.jsonPath, newRefs.map(ref => ({ '$ref': ref })));
        await writeJsonFile(rootSchemaConfig.file, template);
    }
}
