import path from 'path';
import os from 'os';
import { findRecursive, findDirRecursive, executeCmd, rmdirRecursive, lowerCaseCompare, lowerCaseCompareLists, lowerCaseStartsWith, readJsonFile, writeJsonFile, safeMkdir, safeUnlink, fileExists } from './utils';
import * as constants from './constants';
import chalk from 'chalk';
import { ScopeType, WhitelistConfig } from './models';

const autorestBinary = os.platform() === 'win32' ? 'autorest-beta.cmd' : 'autorest-beta';

interface SchemaConfiguration {
    references: SchemaReference[];
    relativePath: string;
}

interface SchemaReference {
    scope: ScopeType;
    type: string;
    reference: string;
}

async function generateSchemas(readme: string, whitelistConfig?: WhitelistConfig) {
    const searchPath = path.resolve(`${readme}/..`);
    const apiVersionPaths = await findDirRecursive(searchPath, p => path.basename(p).match(/^\d{4}-\d{2}-\d{2}(|-preview)$/) !== null);

    for (const subPath of apiVersionPaths) {
        const apiVersion = path.basename(subPath);
        const tmpFolder = path.join(os.tmpdir(), Math.random().toString(36).substr(2));

        try {
            const generatedSchemas = await generateSchema(readme, tmpFolder, apiVersion);

            for (const schemaPath of generatedSchemas) {
                await handleGeneratedSchema(readme, schemaPath, whitelistConfig);
            }
        }
        finally {
            await rmdirRecursive(tmpFolder);
        }
    }
}

async function handleGeneratedSchema(readme: string, schemaPath: string, whitelistConfig?: WhitelistConfig) {
    const namespace = path.basename(schemaPath.substring(0, schemaPath.lastIndexOf(path.extname(schemaPath))));

    if (whitelistConfig && whitelistConfig.namespace.toLowerCase() !== namespace.toLowerCase()) {
        throw new Error(`Encountered unexpected namespace ${namespace} in readme ${readme}`);
    }

    const apiVersion = path.basename(path.resolve(`${schemaPath}/..`));

    const schemaConfig = await generateSchemaConfig(schemaPath, namespace, apiVersion, whitelistConfig);

    const unknownScopeResources = schemaConfig.references.filter(x => x.scope & ScopeType.Unknown);
    if (whitelistConfig && unknownScopeResources.length > 0) {
        throw new Error(`Unable to determine scope for resource types ${unknownScopeResources.map(x => x.type).join(', ')} in readme ${readme}`);
    }

    await saveToSchemasDirectory(schemaPath, schemaConfig);
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
        '--azureresourceschema',
        '--azureresourceschema.multi-scope=true',
        `--output-folder=${tmpFolder}`,
        `--tag=all-api-versions`,
        `--api-version=${apiVersion}`,
        '--title=none',
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

function applyResourceConfig(schemaRefs: SchemaReference[], whitelistConfig?: WhitelistConfig) {
    const resourceConfig = (whitelistConfig || {}).resourceConfig || [];

    for (const schemaRef of schemaRefs) {
        const config = resourceConfig.find(c => lowerCaseCompare(c.type, schemaRef.type) === 0);

        if (config && (schemaRef.scope & ScopeType.Unknown)) {
            schemaRef.scope = config.scopes || ScopeType.None;
        }
    }
}

async function generateSchemaConfig(outputFile: string, namespace: string, apiVersion: string, whitelistConfig?: WhitelistConfig): Promise<SchemaConfiguration> {
    let fileSuffix = '';
    if (whitelistConfig !== undefined) {
        namespace = whitelistConfig.namespace;
        if (whitelistConfig.suffix !== undefined) {
            fileSuffix = `.${whitelistConfig.suffix}`
        }
    }

    const relativePath = `${apiVersion}/${namespace}${fileSuffix}.json`;

    const output = await readJsonFile(outputFile);

    const references = [
        ...getSchemaRefs(output, ScopeType.Tenant, 'tenant_resourceDefinitions'),
        ...getSchemaRefs(output, ScopeType.ManagementGroup, 'managementGroup_resourceDefinitions'),
        ...getSchemaRefs(output, ScopeType.Subcription, 'subscription_resourceDefinitions'),
        ...getSchemaRefs(output, ScopeType.ResourceGroup, 'resourceDefinitions'),
        ...getSchemaRefs(output, ScopeType.Extension, 'extension_resourceDefinitions'),
        ...getSchemaRefs(output, ScopeType.Unknown, 'unknown_resourceDefinitions'),
    ];

    applyResourceConfig(references, whitelistConfig);
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
    if (managementGroupSchemaRefs.length > 0) {2
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

async function saveToSchemasDirectory(outputFile: string, schemaConfig: SchemaConfiguration) {
    const template = await readJsonFile(constants.generatedSchemasTemplatePath);
    const actual = await readJsonFile(constants.generatedSchemasPath);

    const currentRefsOneOf: {[path: string]: string}[] = actual.allOf[1].oneOf;
    const currentRefs = currentRefsOneOf.map(v => v['$ref']);

    const schemaRef = `${constants.schemasBaseUri}/${schemaConfig.relativePath}#`
    const resourceGroupRefs = schemaConfig.references
        .filter(x => x.scope & ScopeType.ResourceGroup)
        .map(x => `${schemaRef}/${x.reference}`);

    const newRefs = [...new Set(currentRefs.concat(resourceGroupRefs))].sort(schemaRefComparer);

    template.allOf[1].oneOf = newRefs.map(ref => ({ '$ref': ref }));

    const schemaPath = path.join(constants.schemasBasePath, schemaConfig.relativePath);

    await safeMkdir(path.dirname(schemaPath));

    const output = await readJsonFile(outputFile);
    output.id = schemaRef;

    await writeJsonFile(schemaPath, output);
    await writeJsonFile(constants.generatedSchemasPath, template);
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

async function clearAutogeneratedSchemas() {
    const template = await readJsonFile(constants.generatedSchemasTemplatePath);

    const current = await readJsonFile(constants.generatedSchemasPath);
    const currentRefsOneOf: {[path: string]: string}[] = current.allOf[1].oneOf;
    const currentRefs = currentRefsOneOf.map(v => v['$ref']);

    // clean up existing schemas to detect deletions
    for (const schemaFile of currentRefs.map(getFilePathFromRef)) {
        await safeUnlink(schemaFile);
    }

    await writeJsonFile(constants.generatedSchemasPath, template);
}

export {
    clearAutogeneratedSchemas,
    generateSchemas,
}