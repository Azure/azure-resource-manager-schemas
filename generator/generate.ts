import path from 'path';
import os from 'os';
import fs from 'fs';
import { promisify } from 'util';
import { findRecursive, findDirRecursive, executeCmd, rmdirRecursive, lowerCaseCompare, lowerCaseCompareLists } from './utils';
import * as constants from './constants';
import chalk from 'chalk';
import { ScopeType, WhitelistConfig } from './models';

const autorestBinary = os.platform() === 'win32' ? 'autorest-beta.cmd' : 'autorest-beta';

const exists = promisify(fs.exists);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const copyFile = promisify(fs.copyFile);
const mkdir = promisify(fs.mkdir);

interface ResourceDefinition {
    scope: ScopeType;
    type: string;
    schemaRef: string;
}

async function generateSchemas(readme: string, whitelistEntry?: WhitelistConfig) {
    const searchPath = path.resolve(`${readme}/..`);
    const apiVersionPaths = await findDirRecursive(searchPath, p => path.basename(p).match(/^\d{4}-\d{2}-\d{2}(|-preview)$/) !== null);

    for (const subPath of apiVersionPaths) {
        const apiVersion = path.basename(subPath);
        const tmpFolder = path.join(os.tmpdir(), Math.random().toString(36).substr(2));

        try {
            const generatedSchemas = await generateSchema(readme, tmpFolder, apiVersion);

            for (const schemaPath of generatedSchemas) {
                await handleGeneratedSchema(readme, schemaPath, whitelistEntry);
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

    const schemaRefs = await generateSchemaRefs(schemaPath, namespace, apiVersion, whitelistConfig);

    const unknownScopeResources = schemaRefs.filter(x => x.scope & ScopeType.Unknown);
    if (whitelistConfig && unknownScopeResources.length > 0) {
        throw new Error(`Unable to determine scope for resource types ${unknownScopeResources.map(x => x.type).join(', ')} in readme ${readme}`);
    }

    await saveToSchemasDirectory(schemaPath, schemaRefs, apiVersion);
}

async function execAutoRest(tmpFolder: string, params: string[]) {
    await executeCmd(__dirname, autorestBinary, params);
    if (!await exists(tmpFolder)) {
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

function getSchemaRefs(schemaUri: string, output: any, scopeType: ScopeType, resourceDefinitionsPath: string): ResourceDefinition[] {
    const resourceDefs = output[resourceDefinitionsPath] || {};
    const resourceKeys = Object.keys(resourceDefs);

    return resourceKeys.map(r => ({
        scope: scopeType,
        type: resourceDefs[r].description.substr(resourceDefs[r].description.indexOf('/') + 1),
        schemaRef: `${schemaUri}#/${resourceDefinitionsPath}/${r}`,
    }));
}

function applyResourceConfig(namespace: string, schemaRefs: ResourceDefinition[], whitelistConfig?: WhitelistConfig) {
    const resourceConfig = (whitelistConfig || {}).resourceConfig || [];

    for (const schemaRef of schemaRefs) {
        const config = resourceConfig.find(c => lowerCaseCompare(c.type, schemaRef.type) === 0);

        if (config && (schemaRef.scope & ScopeType.Unknown)) {
            schemaRef.scope = config.scopes || ScopeType.None;
        }
    }
}

async function generateSchemaRefs(outputFile: string, namespace: string, apiVersion: string, whitelistConfig?: WhitelistConfig): Promise<ResourceDefinition[]> {
    const outputSchemaUri = `${constants.schemasBaseUri}/${apiVersion}/${namespace}.json`;

    const outputContent = await readFile(outputFile, { encoding: 'utf8' });
    const output = JSON.parse(outputContent);

    const schemaRefs = [
        ...getSchemaRefs(outputSchemaUri, output, ScopeType.Tenant, 'tenant_resourceDefinitions'),
        ...getSchemaRefs(outputSchemaUri, output, ScopeType.ManagementGroup, 'managementGroup_resourceDefinitions'),
        ...getSchemaRefs(outputSchemaUri, output, ScopeType.Subcription, 'subscription_resourceDefinitions'),
        ...getSchemaRefs(outputSchemaUri, output, ScopeType.ResourceGroup, 'resourceDefinitions'),
        ...getSchemaRefs(outputSchemaUri, output, ScopeType.Extension, 'extension_resourceDefinitions'),
        ...getSchemaRefs(outputSchemaUri, output, ScopeType.Unknown, 'unknown_resourceDefinitions'),
    ];

    applyResourceConfig(namespace, schemaRefs, whitelistConfig);

    console.log('================================================================================================================================');
    console.log('Filename: ' + chalk.green(outputFile));
    console.log('Provider Namespace: ' + chalk.green(namespace));
    console.log('API Version: ' + chalk.green(apiVersion));

    const tenantSchemaRefs = schemaRefs.filter(x => x.scope & ScopeType.Tenant);
    if (tenantSchemaRefs.length > 0) {
        console.log('Resource Types (Tenant Scope):');
        for (const schemaRef of tenantSchemaRefs) {
            console.log('- ' + chalk.green(schemaRef.type));
        }
    }
   
    const managementGroupSchemaRefs = schemaRefs.filter(x => x.scope & ScopeType.ManagementGroup);
    if (managementGroupSchemaRefs.length > 0) {2
        console.log('Resource Types (Management Group Scope):');
        for (const schemaRef of managementGroupSchemaRefs) {
            console.log('- ' + chalk.green(schemaRef.type));
        }
    }
   
    const subscriptionSchemaRefs = schemaRefs.filter(x => x.scope & ScopeType.Subcription);
    if (subscriptionSchemaRefs.length > 0) {
        console.log('Resource Types (Subscription Scope):');
        for (const schemaRef of subscriptionSchemaRefs) {
            console.log('- ' + chalk.green(schemaRef.type));
        }
    }
   
    const resourceGroupSchemaRefs = schemaRefs.filter(x => x.scope & ScopeType.ResourceGroup);
    if (resourceGroupSchemaRefs.length > 0) {
        console.log('Resource Types (Resource Group Scope):');
        for (const schemaRef of resourceGroupSchemaRefs) {
            console.log('- ' + chalk.green(schemaRef.type));
        }
    }
   
    const extensionSchemaRefs = schemaRefs.filter(x => x.scope & ScopeType.Extension);
    if (extensionSchemaRefs.length > 0) {
        console.log('Resource Types (Extension Scope):');
        for (const schemaRef of extensionSchemaRefs) {
            console.log('- ' + chalk.green(schemaRef.type));
        }
    }
   
    const unknownSchemaRefs = schemaRefs.filter(x => x.scope & ScopeType.Unknown);
    if (unknownSchemaRefs.length > 0) {
        console.log('Resource Types (Unknown Scope):');
        for (const schemaRef of unknownSchemaRefs) {
            console.log('- ' + chalk.red(schemaRef.type));
        }
    }

    console.log('================================================================================================================================');

    return schemaRefs;
}

async function saveToSchemasDirectory(outputFile: string, schemaRefs: ResourceDefinition[], apiVersion: string) {
    const templateContents = await readFile(constants.generatedSchemasTemplatePath, { encoding: 'utf8' });
    const template = JSON.parse(templateContents);

    const actualContents = await readFile(constants.generatedSchemasPath, { encoding: 'utf8' });
    const actual = JSON.parse(actualContents);

    const currentRefsOneOf: {[path: string]: string}[] = actual.allOf[1].oneOf;
    const currentRefs = currentRefsOneOf.map(v => v['$ref']);

    const resourceGroupRefs = schemaRefs.filter(r => r.scope & ScopeType.ResourceGroup).map(r => r.schemaRef);

    const newRefs = [...new Set(currentRefs.concat(resourceGroupRefs))].sort(schemaRefComparer);

    template.allOf[1].oneOf = newRefs.map(ref => ({ '$ref': ref }));

    const schemaPath = path.join(constants.schemasBasePath, apiVersion);
    if (!await exists(schemaPath)) {
        await mkdir(schemaPath);
    }

    await copyFile(outputFile, path.join(schemaPath, path.basename(outputFile)));
    await writeFile(constants.generatedSchemasPath, JSON.stringify(template, null, 2), { encoding: 'utf8' });
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
    const templateContents = await readFile(constants.generatedSchemasTemplatePath, { encoding: 'utf8' });
    const template = JSON.parse(templateContents);

    await writeFile(constants.generatedSchemasPath, JSON.stringify(template, null, 2), { encoding: 'utf8' });
}

export {
    clearAutogeneratedSchemas,
    generateSchemas,
}