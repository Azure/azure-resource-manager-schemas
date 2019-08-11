import path from 'path';
import os from 'os';
import fs from 'fs';
import { promisify } from 'util';
import { findRecursive, findDirRecursive, executeCmd, rmdirRecursive } from './utils';
import * as constants from './constants';
import chalk from 'chalk';
import { isWhitelisted } from './specs';

const autorestBinary = os.platform() === 'win32' ? 'autorest.cmd' : 'autorest';

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

                await saveToSchemasDirectory(schemaPath, schemaRefs, namespace, apiVersion);
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
        `--output-folder=${tmpFolder}`,
        `--api-version=${apiVersion}`,
        '--title=none',
        readme,
    ];

    if (constants.autoRestVerboseOutput) {
        autoRestParams.push('--verbose');
    }

    return await execAutoRest(tmpFolder, autoRestParams);
}

async function generateSchemaRefs(outputFile: string, namespace: string, apiVersion: string) {
    const outputSchemaUri = `${constants.schemasBaseUri}/${apiVersion}/${namespace}.json`;

    const outputContent = await readFile(outputFile, { encoding: 'utf8' });
    const output = JSON.parse(outputContent);

    const resourceDefs: {[path: string]: { description: string }} = output['resourceDefinitions'];
    const resourceKeys = Object.keys(resourceDefs);
    const resourceTypes = resourceKeys.map(r => resourceDefs[r].description);
    const schemaRefs = resourceKeys.map(r => `${outputSchemaUri}#/resourceDefinitions/${r}`);

    console.log('================================================================================================================================');
    console.log('Filename: ' + chalk.green(outputFile));
    console.log('Provider Namespace: ' + chalk.green(namespace));
    console.log('API Version: ' + chalk.green(apiVersion));
    console.log('Resource Types: ');
    for (const resourceType of resourceTypes) {
        console.log('- ' + chalk.green(resourceType));
    }
    console.log('Resource References: ');
    for (const schemaRef of schemaRefs) {
        console.log('- ' + chalk.green(schemaRef));
    }
    console.log('================================================================================================================================');

    return schemaRefs;
}

async function saveToSchemasDirectory(outputFile: string, schemaRefs: string[], namespace: string, apiVersion: string) {
    const templateContents = await readFile(constants.generatedSchemasTemplatePath, { encoding: 'utf8' });
    const template = JSON.parse(templateContents);

    const actualContents = await readFile(constants.generatedSchemasPath, { encoding: 'utf8' });
    const actual = JSON.parse(actualContents);

    const currentRefsOneOf: {[path: string]: string}[] = actual.allOf[1].oneOf;
    const currentRefs = currentRefsOneOf.map(v => v['$ref']);

    const newRefs = [...new Set(currentRefs.concat(schemaRefs))].sort((a, b) => a.toLowerCase() < b.toLowerCase() ? -1 : 1);

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
        .map(p => path.join(localPath, 'specification', p, 'readme.enable-multi-api.md'))
        .map(p => path.resolve(p));
}

export {
    listReadmePaths,
    generateSchemasForReadme,
}