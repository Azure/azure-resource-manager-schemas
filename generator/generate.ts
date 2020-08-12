import path from 'path';
import os from 'os';
import { findRecursive, findDirRecursive, executeCmd, rmdirRecursive, lowerCaseCompare, lowerCaseCompareLists, lowerCaseStartsWith, readJsonFile, writeJsonFile, safeMkdir, safeUnlink, fileExists, lowerCaseEquals, lowerCaseContains } from './utils';
import * as constants from './constants';
import chalk from 'chalk';
import { ScopeType, AutogenlistConfig } from './models';
import { resetFile } from './git';
import { get, set, flatten, uniq, concat, Dictionary, groupBy, keys, difference, pickBy, flatMap, values, uniqBy } from 'lodash';

const autorestBinary = os.platform() === 'win32' ? 'autorest-beta.cmd' : 'autorest-beta';
const apiVersionRegex = /^\d{4}-\d{2}-\d{2}(|-preview)$/;

export interface SchemaConfiguration {
    references: SchemaReference[];
    relativePath: string;
}

interface SchemaReference {
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
    [ScopeType.Subcription, constants.subscriptionRootSchema],
    [ScopeType.ResourceGroup, constants.resourceGroupRootSchema],
    [ScopeType.ManagementGroup, constants.managementGroupRootSchema]
]);

export async function getApiVersionsByNamespace(readme: string): Promise<Dictionary<string[]>> {
    const searchPath = path.resolve(`${readme}/..`);
    const apiVersionPaths = await findDirRecursive(searchPath, p => path.basename(p).match(apiVersionRegex) !== null);

    const output: Dictionary<string[]> = {};
    for (const [namespace, _, apiVersion] of apiVersionPaths.map(p => path.relative(searchPath, p).split(path.sep))) {
        output[namespace] = [...(output[namespace] ?? []), apiVersion];
    }

    return output;
}

export async function generateSchemas(readme: string, autogenlistConfig?: AutogenlistConfig): Promise<SchemaConfiguration[]> {
    const apiVersionsByNamespace = pickBy(
        await getApiVersionsByNamespace(readme),
        (_, key) => !autogenlistConfig || lowerCaseEquals(key, autogenlistConfig.namespace));

    const apiVersions = uniqBy(flatMap(values(apiVersionsByNamespace)), s => s.toLowerCase());
    const namespaces = keys(apiVersionsByNamespace);

    const schemaConfigs: SchemaConfiguration[] = [];
    for (const apiVersion of apiVersions) {
        const tmpFolder = path.join(os.tmpdir(), Math.random().toString(36).substr(2));

        try {
            const generatedSchemas = await generateSchema(readme, tmpFolder, apiVersion);

            for (const schemaPath of generatedSchemas) {
                const namespace = path.basename(schemaPath.substring(0, schemaPath.lastIndexOf(path.extname(schemaPath))));
                if (!lowerCaseContains(namespaces, namespace)) {
                    continue;
                }

                const generatedSchemaConfig = await handleGeneratedSchema(readme, schemaPath, autogenlistConfig);

                schemaConfigs.push(generatedSchemaConfig);
            }
        }
        finally {
            await rmdirRecursive(tmpFolder);
        }
    }

    return schemaConfigs;
}

export async function schemaPostProcess(schemaPath: string, isNew: boolean, autogenlistConfig?: AutogenlistConfig) {
    const namespace = path.basename(schemaPath.substring(0, schemaPath.lastIndexOf(path.extname(schemaPath))));
    const apiVersion = path.basename(path.resolve(`${schemaPath}/..`));
    const schemaConfig = await generateSchemaConfig(schemaPath, namespace, apiVersion, autogenlistConfig);
    const unknownScopeResources = schemaConfig.references.filter(x => x.scope & ScopeType.Unknown);
    if (autogenlistConfig && unknownScopeResources.length > 0) {
        throw new Error(`Unable to determine scope for resource types ${unknownScopeResources.map(x => x.type).join(', ')} for file ${schemaPath}`);
    }

    await saveSchemaFile(schemaPath, schemaConfig);
    const schemaPathNew = path.join(constants.schemasBasePath, schemaConfig.relativePath);

    if (schemaPathNew !== schemaPath) {
        if (isNew) {
            console.log('Delete file: ' + chalk.red(schemaPath));
            safeUnlink(schemaPath);
        } else {
            console.log('Reset file: ' + chalk.green(schemaPath));
            resetFile(path.dirname(schemaPath), path.basename(schemaPath));
        }
    }

    return schemaConfig;
}

async function handleGeneratedSchema(readme: string, schemaPath: string, autogenlistConfig?: AutogenlistConfig) {
    const namespace = path.basename(schemaPath.substring(0, schemaPath.lastIndexOf(path.extname(schemaPath))));

    if (autogenlistConfig && autogenlistConfig.namespace.toLowerCase() !== namespace.toLowerCase()) {
        throw new Error(`Encountered unexpected namespace ${namespace} in readme ${readme}`);
    }

    const apiVersion = path.basename(path.resolve(`${schemaPath}/..`));

    const schemaConfig = await generateSchemaConfig(schemaPath, namespace, apiVersion, autogenlistConfig);

    const unknownScopeResources = schemaConfig.references.filter(x => x.scope & ScopeType.Unknown);
    if (autogenlistConfig && unknownScopeResources.length > 0) {
        throw new Error(`Unable to determine scope for resource types ${unknownScopeResources.map(x => x.type).join(', ')} in readme ${readme}`);
    }

    await saveSchemaFile(schemaPath, schemaConfig);

    return schemaConfig;
}

async function execAutoRest(tmpFolder: string, params: string[]) {
    await executeCmd(__dirname, autorestBinary, params);
    if (!await fileExists(tmpFolder)) {
        return [];
    }

    return await findRecursive(tmpFolder, p => path.extname(p) === '.json');
}

async function generateSchema(readme: string, tmpFolder: string, apiVersion: string) {
    const autoRestParams = [
        `--version=${constants.autorestCoreVersion}`,
        `--use=@autorest/azureresourceschema@${constants.azureresourceschemaVersion}`,
        '--azureresourceschema',
        `--output-folder=${tmpFolder}`,
        `--tag=all-api-versions`,
        `--api-version=${apiVersion}`,
        '--title=none',
        '--pass-thru:subset-reducer',
        readme,
    ];

    if (constants.autoRestVerboseOutput) {
        autoRestParams.push('--verbose');
    }

    return await execAutoRest(tmpFolder, autoRestParams);
}

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

function assignScopesToUnknownReferences(knownReferences: SchemaReference[], unknownReferences: SchemaReference[], autogenlistConfig?: AutogenlistConfig) {
    const resourceConfig = (autogenlistConfig || {}).resourceConfig || [];

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

async function generateSchemaConfig(outputFile: string, namespace: string, apiVersion: string, autogenlistConfig?: AutogenlistConfig): Promise<SchemaConfiguration> {
    namespace = autogenlistConfig?.namespace ?? namespace;
    const suffix = autogenlistConfig?.suffix;
    const relativePath = `${apiVersion}/${getSchemaFileName(namespace, suffix)}`;

    let output = await readJsonFile(outputFile);
    if (autogenlistConfig?.postProcessor) {
        autogenlistConfig?.postProcessor(namespace, apiVersion, output);

        await writeJsonFile(outputFile, output);
    }

    const knownReferences = [
        ...getSchemaRefs(output, ScopeType.Tenant, 'tenant_resourceDefinitions'),
        ...getSchemaRefs(output, ScopeType.ManagementGroup, 'managementGroup_resourceDefinitions'),
        ...getSchemaRefs(output, ScopeType.Subcription, 'subscription_resourceDefinitions'),
        ...getSchemaRefs(output, ScopeType.ResourceGroup, 'resourceDefinitions'),
        ...getSchemaRefs(output, ScopeType.Extension, 'extension_resourceDefinitions'),
    ];

    const unknownReferences = getSchemaRefs(output, ScopeType.Unknown, 'unknown_resourceDefinitions');
    assignScopesToUnknownReferences(knownReferences, unknownReferences, autogenlistConfig);

    const references = [
        ...knownReferences,
        ...unknownReferences,
    ];

    const schemaPath = path.join(constants.schemasBasePath, relativePath);

    console.log('================================================================================================================================');
    console.log('Filename: ' + chalk.green(schemaPath));
    console.log('Provider Namespace: ' + chalk.green(namespace));
    console.log('API Version: ' + chalk.green(apiVersion));

    const tenantSchemaRefs = references.filter(x => x.scope & ScopeType.Tenant);
    if (tenantSchemaRefs.length > 0) {
        console.log('Resource Types (Tenant Scope):');
        for (const schemaRef of tenantSchemaRefs) {
            console.log('- ' + chalk.green(schemaRef.type));
        }
    }

    const managementGroupSchemaRefs = references.filter(x => x.scope & ScopeType.ManagementGroup);
    if (managementGroupSchemaRefs.length > 0) {
        console.log('Resource Types (Management Group Scope):');
        for (const schemaRef of managementGroupSchemaRefs) {
            console.log('- ' + chalk.green(schemaRef.type));
        }
    }

    const subscriptionSchemaRefs = references.filter(x => x.scope & ScopeType.Subcription);
    if (subscriptionSchemaRefs.length > 0) {
        console.log('Resource Types (Subscription Scope):');
        for (const schemaRef of subscriptionSchemaRefs) {
            console.log('- ' + chalk.green(schemaRef.type));
        }
    }

    const resourceGroupSchemaRefs = references.filter(x => x.scope & ScopeType.ResourceGroup);
    if (resourceGroupSchemaRefs.length > 0) {
        console.log('Resource Types (Resource Group Scope):');
        for (const schemaRef of resourceGroupSchemaRefs) {
            console.log('- ' + chalk.green(schemaRef.type));
        }
    }

    const extensionSchemaRefs = references.filter(x => x.scope & ScopeType.Extension);
    if (extensionSchemaRefs.length > 0) {
        console.log('Resource Types (Extension Scope):');
        for (const schemaRef of extensionSchemaRefs) {
            console.log('- ' + chalk.green(schemaRef.type));
        }
    }

    const unknownSchemaRefs = references.filter(x => x.scope & ScopeType.Unknown);
    if (unknownSchemaRefs.length > 0) {
        console.log('Resource Types (Unknown Scope):');
        for (const schemaRef of unknownSchemaRefs) {
            console.log('- ' + chalk.red(schemaRef.type));
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

export async function clearAutogeneratedSchemaRefs(autogenlist: AutogenlistConfig[]) {
    RootSchemaConfigs.forEach(async (rootSchemaConfig, scopeType) => {
        const currentRefs = await getCurrentTemplateRefs(scopeType, rootSchemaConfig);
        const autogenlistedFiles = new Set(autogenlist.map(x => getSchemaFileName(x.namespace, x.suffix).toLowerCase()));
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
    });
}

export async function saveAutogeneratedSchemaRefs(schemaConfigs: SchemaConfiguration[]) {
    RootSchemaConfigs.forEach(async (rootSchemaConfig, scopeType) => {
        const refs = flatten(schemaConfigs
            .map(c => c.references
                .filter(x => x.scope & scopeType)
                .map(x => `${constants.schemasBaseUri}/${c.relativePath}#/${x.reference}`)));

        const currentRefs = await getCurrentTemplateRefs(scopeType, rootSchemaConfig);
        const newRefs = uniq(concat(currentRefs, refs)).sort(schemaRefComparer);
        const template = await readJsonFile(rootSchemaConfig.file);
        set(template, rootSchemaConfig.jsonPath, newRefs.map(ref => ({ '$ref': ref })));
        await writeJsonFile(rootSchemaConfig.file, template);
    });
}
