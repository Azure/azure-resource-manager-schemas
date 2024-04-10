// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import path from 'path';
import os from 'os';
import { findRecursive, lowerCaseContains, executeCmd, fileExists } from './utils';
import * as constants from './constants';
import { ReadmeTag, AutoGenConfig, CodeBlock } from './models';
import * as cm from '@ts-common/commonmark-to-markdown'
import * as yaml from 'js-yaml'
import { readFile, writeFile } from 'fs/promises';

const autorestBinary = os.platform() === 'win32' ? 'autorest.cmd' : 'autorest';
export const apiVersionRegex = /^\d{4}-\d{2}-\d{2}(|-preview)$/;

async function execAutoRest(tmpFolder: string, params: string[]) {
    await executeCmd(__dirname, `${__dirname}/node_modules/.bin/${autorestBinary}`, params);
    if (!fileExists(tmpFolder)) {
        return [];
    }

    return await findRecursive(tmpFolder, p => path.extname(p) === '.json');
}

export async function runAutorest(readme: string, tmpFolder: string) {
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



export async function generateAutorestConfig(readme: string, autoGenConfig: AutoGenConfig) {
    const content = (await readFile(readme)).toString();
    const markdownEx = cm.parse(content);
    const fileSet = new Set<string>();
    for (const node of cm.iterate(markdownEx.markDown)) {
        // We're only interested in yaml code blocks
        if (node.type !== 'code_block' || !node.info || !node.literal ||
            !node.info.trim().startsWith('yaml')) {
            continue;
        }
        
        const DOC = (yaml.load(node.literal) as CodeBlock);
        if (DOC) {
            const inputFile = DOC['input-file'];
            if (typeof inputFile === 'string') {
                fileSet.add(inputFile);
            } else if (inputFile instanceof Array) {
                for (const i of inputFile) {
                    fileSet.add(i);
                }
            }
        }
    }

    let readmeTag = {} as ReadmeTag;
    for (const inputFile of fileSet) {
        const pathComponents = inputFile.split("/");

        if (!autoGenConfig.useNamespaceFromConfig &&
            !lowerCaseContains(pathComponents, autoGenConfig.namespace)) {
            continue;
        }

        const apiVersion = pathComponents.filter(p => p.match(apiVersionRegex) !== null)[0];
        if (!apiVersion) {
            continue;
        }

        readmeTag[apiVersion] ??= readmeTag[apiVersion] || [];
        readmeTag[apiVersion].push(inputFile);
    }

    if (autoGenConfig.readmeTag) {
        readmeTag = {...readmeTag, ...autoGenConfig.readmeTag };
    }

    const schemaReadmeContent = compositeSchemaReadme(readmeTag);

    const schemaReadme = readme.replace(/\.md$/i, '.azureresourceschema.md');

    await writeFile(schemaReadme, schemaReadmeContent);
}

function compositeSchemaReadme(readmeTag: ReadmeTag): string {
    let content =
`## AzureResourceSchema

### AzureResourceSchema multi-api

\`\`\` yaml $(azureresourceschema) && $(multiapi)
${yaml.dump({ 'batch': Object.keys(readmeTag).map(apiVersion => ({ 'tag': `schema-${apiVersion}`})) }, { lineWidth: 1000 })}
\`\`\`

`
    for (const apiVersion of Object.keys(readmeTag)) {
        content +=
`
### Tag: schema-${apiVersion} and azureresourceschema

\`\`\` yaml $(tag) == 'schema-${apiVersion}' && $(azureresourceschema)
${yaml.dump({ 'input-file': readmeTag[apiVersion] }, { lineWidth: 1000})}
\`\`\`
`
    }
    return content;
}