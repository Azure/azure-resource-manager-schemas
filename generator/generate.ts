// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import path from 'path';
import os from 'os';
import { findRecursive, findDirRecursive, executeCmd, rmdirRecursive, lowerCaseCompare, lowerCaseCompareLists, lowerCaseStartsWith, readJsonFile, writeJsonFile, safeMkdir, safeUnlink, fileExists, lowerCaseEquals } from './utils';
import * as constants from './constants';
import { prepareReadme } from './specs';
import colors from 'colors';
import { ScopeType, AutoGenConfig } from './models';
import { get, set, flatten, uniq, concat, Dictionary, groupBy, keys, difference } from 'lodash';

const autorestBinary = os.platform() === 'win32' ? 'autorest.cmd' : 'autorest';
export const apiVersionRegex = /^\d{4}-\d{2}-\d{2}(|-preview)$/;

export interface SchemaConfiguration {
    references: SchemaReference[];
    relativePath: string;
}

export interface SchemaReference {
    scope: ScopeType;
    type: string;
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

export async function detectProviderNamespaces(readme: string) {
    const searchPath = path.resolve(`${readme}/..`);

    // To try and detect possible provider namespaces, assume a folder structure of <provider>/preview|stable/<api-version>/..., based on convention
    const apiVersionPaths = await findDirRecursive(searchPath, p => path.basename(p).match(apiVersionRegex) !== null);
    return uniq(apiVersionPaths.map(p => path.relative(searchPath, p).split(path.sep)[0]));
}

export async function generateSchemas(readme: string, autoGenConfig: AutoGenConfig): Promise<SchemaConfiguration[]> {
    await prepareReadme(readme, autoGenConfig);

    const schemaConfigs: SchemaConfiguration[] = [];
    const tmpFolder = path.join(os.tmpdir(), Math.random().toString(36).substr(2));

    try {
        const generatedSchemas = await generateSchema(readme, tmpFolder);

        for (const schemaPath of generatedSchemas) {
            const namespace = path.basename(schemaPath.substring(0, schemaPath.lastIndexOf(path.extname(schemaPath))));
            if (!lowerCaseEquals(autoGenConfig.namespace, namespace)) {
                continue;
            }

            const generatedSchemaConfig = await handleGeneratedSchema(readme, schemaPath, autoGenConfig);

            schemaConfigs.push(generatedSchemaConfig);
        }
    }
    finally {
        await rmdirRecursive(tmpFolder);
    }

    return schemaConfigs;
}

async function handleGeneratedSchema(readme: string, schemaPath: string, autoGenConfig?: AutoGenConfig) {
    const namespace = path.basename(schemaPath.substring(0, schemaPath.lastIndexOf(path.extname(schemaPath))));

    if (autoGenConfig && autoGenConfig.namespace.toLowerCase() !== namespace.toLowerCase()) {
        throw new Error(`Encountered unexpected namespace ${namespace} in readme ${readme}`);
    }

    const apiVersion = path.basename(path.resolve(`${schemaPath}/..`));

    const schemaConfig = await generateSchemaConfig(schemaPath, namespace, apiVersion, autoGenConfig);

    const unknownScopeResources = schemaConfig.references.filter(x => x.scope & ScopeType.Unknown);
    if (autoGenConfig && unknownScopeResources.length > 0) {
        throw new Error(`Unable to determine scope for resource types ${unknownScopeResources.map(x => x.type).join(', ')} in readme ${readme}`);
    }

    await saveSchemaFile(schemaPath, schemaConfig);

    return schemaConfig;
}

async function execAutoRest(tmpFolder: string, params: string[]) {
    await executeCmd(__dirname, `${__dirname}/node_modules/.bin/${autorestBinary}`, params);
    if (!fileExists(tmpFolder)) {
        return [];
    }

    return await findRecursive(tmpFolder, p => path.extname(p) === '.json');
}

async function generateSchema(readme: string, tmpFolder: string) {
    const autoRestParams = [
        `--version=${constants.autorestCoreVersion}`,
        `--use=@autorest/azureresourceschema@${constants.azureresourceschemaVersion}`,
        '--azureresourceschema',
        `--output-folder=${tmpFolder}`,
        '--multiapi',
        '--pass-thru:subset-reducer',
        '--pass-thru:schema-validator-swagger',
        readme,
    ];

    if (constants.autoRestVerboseOutput) {
        autoRestParams.push('--verbose');
    }

    return await execAutoRest(tmpFolder, autoRestParams);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSchemaRefs(output: any, scopeType: ScopeType, resourceDefinitionsPath: string): SchemaReference[] {
    const resourceDefs = output[resourceDefinitionsPath] || {};
    const resourceKeys = Object.keys(resourceDefs);

    return resourceKeys.map(r => ({
        scope: scopeType,
        type: resourceDefs[r].description.substr(resourceDefs[r].description.indexOf('/') + 1),
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

function assignScopesToUnknownReferences(knownReferences: SchemaReference[], unknownReferences: SchemaReference[], autoGenConfig?: AutoGenConfig) {
    const resourceConfig = (autoGenConfig || {}).resourceConfig || [];

    for (const schemaRef of unknownReferences) {
        const config = resourceConfig.find(c => lowerCaseCompare(c.type, schemaRef.type) === 0);

        if (config && (schemaRef.scope & ScopeType.Unknown)) {
            schemaRef.scope = config.scopes || ScopeType.None;
        }

        for (const knownReference of knownReferences.filter(r => lowerCaseCompare(r.type, schemaRef.type) === 0)) {
            // remove resources for scopes that have already been declared elsewhere to avoid duplication
            schemaRef.scope &= ~knownReference.scope;
        }
    }
}

function getSchemaFileName(namespace: string, suffix: string | undefined) {
    if (suffix === undefined) {
        return `${namespace}.json`
    }

    return `${namespace}.${suffix}.json`;
}

async function generateSchemaConfig(outputFile: string, namespace: string, apiVersion: string, autoGenConfig?: AutoGenConfig): Promise<SchemaConfiguration> {
    namespace = autoGenConfig?.namespace ?? namespace;
    const suffix = autoGenConfig?.suffix;
    const relativePath = `${apiVersion}/${getSchemaFileName(namespace, suffix)}`;

    const output = await readJsonFile(outputFile);
    if (autoGenConfig?.postProcessor) {
        await autoGenConfig?.postProcessor(namespace, apiVersion, output);

        await writeJsonFile(outputFile, output);
    }

    const knownReferences = [
        ...getSchemaRefs(output, ScopeType.Tenant, 'tenant_resourceDefinitions'),
        ...getSchemaRefs(output, ScopeType.ManagementGroup, 'managementGroup_resourceDefinitions'),
        ...getSchemaRefs(output, ScopeType.Subscription, 'subscription_resourceDefinitions'),
        ...getSchemaRefs(output, ScopeType.ResourceGroup, 'resourceDefinitions'),
        ...getSchemaRefs(output, ScopeType.Extension, 'extension_resourceDefinitions'),
    ];

    const unknownReferences = getSchemaRefs(output, ScopeType.Unknown, 'unknown_resourceDefinitions');
    assignScopesToUnknownReferences(knownReferences, unknownReferences, autoGenConfig);

    const references = [
        ...knownReferences,
        ...unknownReferences,
    ];

    const schemaPath = path.join(constants.schemasBasePath, relativePath);

    console.log('================================================================================================================================');
    console.log('Filename: ' + colors.green(schemaPath));
    console.log('Provider Namespace: ' + colors.green(namespace));
    console.log('API Version: ' + colors.green(apiVersion));

    const tenantSchemaRefs = references.filter(x => x.scope & ScopeType.Tenant);
    if (tenantSchemaRefs.length > 0) {
        console.log('Resource Types (Tenant Scope):');
        for (const schemaRef of tenantSchemaRefs) {
            console.log('- ' + colors.green(schemaRef.type));
        }
    }

    const managementGroupSchemaRefs = references.filter(x => x.scope & ScopeType.ManagementGroup);
    if (managementGroupSchemaRefs.length > 0) {
        console.log('Resource Types (Management Group Scope):');
        for (const schemaRef of managementGroupSchemaRefs) {
            console.log('- ' + colors.green(schemaRef.type));
        }
    }

    const subscriptionSchemaRefs = references.filter(x => x.scope & ScopeType.Subscription);
    if (subscriptionSchemaRefs.length > 0) {
        console.log('Resource Types (Subscription Scope):');
        for (const schemaRef of subscriptionSchemaRefs) {
            console.log('- ' + colors.green(schemaRef.type));
        }
    }

    const resourceGroupSchemaRefs = references.filter(x => x.scope & ScopeType.ResourceGroup);
    if (resourceGroupSchemaRefs.length > 0) {
        console.log('Resource Types (Resource Group Scope):');
        for (const schemaRef of resourceGroupSchemaRefs) {
            console.log('- ' + colors.green(schemaRef.type));
        }
    }

    const extensionSchemaRefs = references.filter(x => x.scope & ScopeType.Extension);
    if (extensionSchemaRefs.length > 0) {
        console.log('Resource Types (Extension Scope):');
        for (const schemaRef of extensionSchemaRefs) {
            console.log('- ' + colors.green(schemaRef.type));
        }
    }

    const unknownSchemaRefs = references.filter(x => x.scope & ScopeType.Unknown);
    if (unknownSchemaRefs.length > 0) {
        console.log('Resource Types (Unknown Scope):');
        for (const schemaRef of unknownSchemaRefs) {
            console.log('- ' + colors.red(schemaRef.type));
        }
    }

    console.log('================================================================================================================================');

    return {
        references,
        relativePath,
    };
}

async function saveSchemaFile(outputFile: string, schemaConfig: SchemaConfiguration) {
    const schemaRef = `${constants.schemasBaseUri}/${schemaConfig.relativePath}#`

    const schemaPath = path.join(constants.schemasBasePath, schemaConfig.relativePath);

    await safeMkdir(path.dirname(schemaPath));

    const output = await readJsonFile(outputFile);
    output.id = schemaRef;

    await writeJsonFile(schemaPath, output);
}

function schemaRefComparer(schemaRefA: string, schemaRefB: string) {
    const splitA = schemaRefA.substr(constants.schemasBaseUri.length + 1).split('/');
    const splitB = schemaRefB.substr(constants.schemasBaseUri.length + 1).split('/');

    // order by namespace, then API version, then the rest
    return lowerCaseCompareLists(
        [...splitA.slice(1, 2), ...splitA.slice(0, 1), ...splitA.slice(2)],
        [...splitB.slice(1, 2), ...splitB.slice(0, 1), ...splitB.slice(2)]
    );
}

async function getCurrentTemplateRefs(scopeType: ScopeType, rootSchemaConfig: RootSchemaConfiguration) {
    const current = await readJsonFile(rootSchemaConfig.file);
    const currentRefsOneOf = get(current, rootSchemaConfig.jsonPath) as Dictionary<string>[];
    return currentRefsOneOf.map(v => v['$ref']);
}

export async function clearAutoGeneratedSchemaRefs(autoGenList: AutoGenConfig[]) {
    for (const [scopeType, rootSchemaConfig] of RootSchemaConfigs) {
        const currentRefs = await getCurrentTemplateRefs(scopeType, rootSchemaConfig);
        const autogenlistedFiles = new Set(autoGenList.map(x => getSchemaFileName(x.namespace, x.suffix).toLowerCase()));
        const schemasToRemove = [];
        const schemasByFilePath = groupBy(currentRefs, getFilePathFromRef);
        // clean up existing schemas to detect deletions
        for (const schemaFile of keys(schemasByFilePath)) {
            const fileName = path.basename(schemaFile).toLowerCase();
            if (autogenlistedFiles.has(fileName)) {
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

        const currentRefs = await getCurrentTemplateRefs(scopeType, rootSchemaConfig);
        const newRefs = uniq(concat(currentRefs, refs)).sort(schemaRefComparer);
        const template = await readJsonFile(rootSchemaConfig.file);
        set(template, rootSchemaConfig.jsonPath, newRefs.map(ref => ({ '$ref': ref })));
        await writeJsonFile(rootSchemaConfig.file, template);
    }
}
