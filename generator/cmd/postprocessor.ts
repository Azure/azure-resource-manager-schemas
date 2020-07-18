import path from 'path';
import chalk from 'chalk';
import { findAutogenEntriesByNamespace } from '../autogenlist';
import { rmdirRecursive, findRecursive, executeSynchronous, readJsonFile, writeJsonFile } from '../utils';
import * as constants from '../constants';
import { AutogenlistConfig } from '../models';

function getSchemaFileName(namespace: string, suffix: string | undefined) {
    if (suffix === undefined) {
        return `${namespace}.json`
    }

    return `${namespace}.${suffix}.json`;
}

executeSynchronous(async () => {
    const generatedSchemasFolder = path.join(constants.generatorRoot, 'tmp');
    const generatedSchemas = await findRecursive(generatedSchemasFolder, p => path.extname(p) === '.json');
    try {
        for (const generatedSchema of generatedSchemas) {
            const output = await readJsonFile(generatedSchema);
            console.log('Src FileName: ' + chalk.green(generatedSchema));
            const namespace = path.basename(generatedSchema.substring(0, generatedSchema.lastIndexOf(path.extname(generatedSchema))));
            const apiVersion = path.basename(path.resolve(`${generatedSchema}/..`));
            const autogenlistConfig = findAutogenEntriesByNamespace(namespace);
            const suffix = autogenlistConfig?.suffix;
            const relativePath = `${apiVersion}/${getSchemaFileName(namespace, suffix)}`;
            const schemaPath = path.join(constants.schemasBasePath, relativePath);
            await writeJsonFile(schemaPath, output);
            console.log('Dist FileName: ' + chalk.green(schemaPath));
        }
    }
    finally {
        await rmdirRecursive(generatedSchemasFolder);
    }
});
