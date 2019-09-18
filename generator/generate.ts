import path from 'path';
import os from 'os';
import fs from 'fs';
import { promisify } from 'util';
import { findRecursive, findDirRecursive, executeCmd, rmdirRecursive } from './utils';
import * as constants from './constants';
import chalk from 'chalk';
import { isWhitelisted } from './specs';

const autorestBinary = os.platform() === 'win32' ? 'autorest-beta.cmd' : 'autorest-beta';

const exists = promisify(fs.exists);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const copyFile = promisify(fs.copyFile);
const mkdir = promisify(fs.mkdir);

async function generateSchemasForReadme(readme: string) {
    const searchPath = path.resolve(`${readme}/..`);
    const apiVersionPaths = await findDirRecursive(searchPath, p => path.basename(p).match(/^\d{4}-\d{2}-\d{2}(|-preview)$/) !== null);

    for (const subPath of apiVersionPaths) {
        const apiVersion = path.basename(subPath);
        const tmpFolder = path.join(os.tmpdir(), Math.random().toString(36).substr(2));

        try {
            const generatedSchemas = await generateSchema(readme, tmpFolder, apiVersion);

            for (const schemaPath of generatedSchemas) {
                const namespace = path.basename(schemaPath.substring(0, schemaPath.lastIndexOf(path.extname(schemaPath))));
                const apiVersion = path.basename(path.resolve(`${schemaPath}/..`));

                const schemaRefs = await generateSchemaRefs(schemaPath, namespace, apiVersion);

                await saveToSchemasDirectory(schemaPath, schemaRefs, apiVersion);
            }
        }
        finally {
            await rmdirRecursive(tmpFolder);
        }
    }
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

enum ScopeType {
    Unknown = 0,
    Tenant,
    Subcription,
    ResourceGroup,
    ManagementGroup,
    Extension,
}

interface ResourceDefinition {
    scope: ScopeType;
    resourceType: string;
    schemaRef: string;
}

function getResourceContainerPath(scopeType: ScopeType): string {
    switch (scopeType) {
        case ScopeType.Tenant:
            return 'tenant_resourceDefinitions';
        case ScopeType.Subcription:
            return 'subscription_ResourceDefinitions';
        case ScopeType.ResourceGroup:
            return 'resourceDefinitions';
        case ScopeType.ManagementGroup:
            return 'managementGroup_resourceDefinitions';
        case ScopeType.Extension:
            return 'extension_resourceDefinitions';
        default:
            return 'unknown_resourceDefinitions';
    }
}

function getSchemaRefs(schemaUri: string, output: any, scopeType: ScopeType): ResourceDefinition[] {
    var schemaJsonPath = getResourceContainerPath(scopeType);

    const resourceDefs = output[schemaJsonPath] || {};
    const resourceKeys = Object.keys(resourceDefs);

    return resourceKeys.map(r => ({
        scope: scopeType,
        resourceType: resourceDefs[r].description,
        schemaRef: `${schemaUri}#/${schemaJsonPath}/${r}`,
    }));
}

async function generateSchemaRefs(outputFile: string, namespace: string, apiVersion: string): Promise<ResourceDefinition[]> {
    const outputSchemaUri = `${constants.schemasBaseUri}/${apiVersion}/${namespace}.json`;

    const outputContent = await readFile(outputFile, { encoding: 'utf8' });
    const output = JSON.parse(outputContent);

    const tenantSchemaRefs = getSchemaRefs(outputSchemaUri, output, ScopeType.Tenant);
    const managementGroupSchemaRefs = getSchemaRefs(outputSchemaUri, output, ScopeType.ManagementGroup);
    const subscriptionSchemaRefs = getSchemaRefs(outputSchemaUri, output, ScopeType.Subcription);
    const resourceGroupSchemaRefs = getSchemaRefs(outputSchemaUri, output, ScopeType.ResourceGroup);
    const extensionSchemaRefs = getSchemaRefs(outputSchemaUri, output, ScopeType.Extension);
    const unknownSchemaRefs = getSchemaRefs(outputSchemaUri, output, ScopeType.Unknown);

    console.log('================================================================================================================================');
    console.log('Filename: ' + chalk.green(outputFile));
    console.log('Provider Namespace: ' + chalk.green(namespace));
    console.log('API Version: ' + chalk.green(apiVersion));
   
    if (tenantSchemaRefs.length > 0) {
        console.log('Resource Types (Tenant Scope):');
        for (const schemaRef of tenantSchemaRefs) {
            console.log('- ' + chalk.green(schemaRef.resourceType));
        }
    }
   
    if (managementGroupSchemaRefs.length > 0) {
        console.log('Resource Types (Management Group Scope):');
        for (const schemaRef of managementGroupSchemaRefs) {
            console.log('- ' + chalk.green(schemaRef.resourceType));
        }
    }
   
    if (subscriptionSchemaRefs.length > 0) {
        console.log('Resource Types (Subscription Scope):');
        for (const schemaRef of subscriptionSchemaRefs) {
            console.log('- ' + chalk.green(schemaRef.resourceType));
        }
    }
   
    if (resourceGroupSchemaRefs.length > 0) {
        console.log('Resource Types (Resource Group Scope):');
        for (const schemaRef of resourceGroupSchemaRefs) {
            console.log('- ' + chalk.green(schemaRef.resourceType));
        }
    }
   
    if (extensionSchemaRefs.length > 0) {
        console.log('Resource Types (Extension Scope):');
        for (const schemaRef of extensionSchemaRefs) {
            console.log('- ' + chalk.green(schemaRef.resourceType));
        }
    }
   
    if (unknownSchemaRefs.length > 0) {
        console.log('Resource Types (Unknown Scope):');
        for (const schemaRef of unknownSchemaRefs) {
            console.log('- ' + chalk.green(schemaRef.resourceType));
        }
    }

    console.log('================================================================================================================================');

    return [
        ...tenantSchemaRefs,
        ...managementGroupSchemaRefs,
        ...subscriptionSchemaRefs,
        ...resourceGroupSchemaRefs,
        ...extensionSchemaRefs,
        ...unknownSchemaRefs,
    ];
}

async function saveToSchemasDirectory(outputFile: string, schemaRefs: ResourceDefinition[], apiVersion: string) {
    const templateContents = await readFile(constants.generatedSchemasTemplatePath, { encoding: 'utf8' });
    const template = JSON.parse(templateContents);

    const actualContents = await readFile(constants.generatedSchemasPath, { encoding: 'utf8' });
    const actual = JSON.parse(actualContents);

    const currentRefsOneOf: {[path: string]: string}[] = actual.allOf[1].oneOf;
    const currentRefs = currentRefsOneOf.map(v => v['$ref']);

    const resourceGroupRefs = schemaRefs.filter(r => r.scope == ScopeType.ResourceGroup).map(r => r.schemaRef);

    const newRefs = [...new Set(currentRefs.concat(resourceGroupRefs))].sort((a, b) => a.toLowerCase() < b.toLowerCase() ? -1 : 1);

    template.allOf[1].oneOf = newRefs.map(ref => ({ '$ref': ref }));

    const schemaPath = path.join(constants.schemasBasePath, apiVersion);
    if (!await exists(schemaPath)) {
        await mkdir(schemaPath);
    }

    await copyFile(outputFile, path.join(schemaPath, path.basename(outputFile)));
    await writeFile(constants.generatedSchemasPath, JSON.stringify(template, null, 2), { encoding: 'utf8' });
}

async function listReadmePaths(localPath: string, basePaths: string[]) {
    return basePaths
        .filter(p => isWhitelisted(p))
        .map(p => path.join(localPath, 'specification', p, 'readme.md'))
        .map(p => path.resolve(p));
}

export {
    listReadmePaths,
    generateSchemasForReadme,
}