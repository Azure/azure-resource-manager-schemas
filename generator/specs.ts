// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import path from 'path';
import { cloneGitRepo } from './git';
import { findRecursive, lowerCaseContains } from './utils';
import { ReadmeTag, AutoGenConfig, CodeBlock } from './models';
import * as constants from './constants'
import * as cm from '@ts-common/commonmark-to-markdown'
import * as yaml from 'js-yaml'
import { existsSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { apiVersionRegex } from './generate';

export async function resolveAbsolutePath(localPath: string) {
    if (path.isAbsolute(localPath)) {
        return path.resolve(localPath);
    }
    return path.resolve(constants.generatorRoot, localPath);
}

export function validateAndReturnReadmePath(localPath: string, basePath: string) {
    let readme = '';
    if (basePath.toLowerCase().endsWith('readme.md')) {
        readme = path.resolve(localPath, basePath);
    } else {
        readme = path.resolve(localPath, 'specification', basePath, 'readme.md')
    }

    if (!existsSync(readme)) {
        throw new Error(`Unable to find readme '${readme}' in specs repo`);
    }

    return readme;
}

export async function cloneAndGenerateBasePaths(localPath: string, remoteUri: string, commitHash: string) {
    await cloneGitRepo(localPath, remoteUri, commitHash);

    return await generateBasePaths(localPath);
}

export async function generateBasePaths(localPath: string) {
    const specsPath = path.join(localPath, 'specification');

    const filePaths = await findRecursive(specsPath, filePath => {
        if (path.basename(filePath) !== 'readme.md') {
            return false;
        }

        return filePath
            .split(path.sep)
            .some(parent => parent == 'resource-manager');
    });

    return filePaths
        .map(p => p.substring(0, p.lastIndexOf(path.sep)))
        .map(getBasePathString.bind(null, localPath))
        .filter(p => !isExcludedBasePath(p));
}

export function getBasePathString(localPath: string, basePath: string) {
    return path
        .relative(path.join(localPath, 'specification'), basePath)
        .split(path.sep)
        .join('/');
}

export function getPackageString(readme: string) {
    return readme
        .split(path.sep)
        .find((_, index, obj) => index > 0 && obj[index - 1] === 'specification');
}

function isExcludedBasePath(basePath: string) {
    return constants.excludedBasePathPrefixes
        .map(prefix => prefix.toLowerCase())
        .some(prefix => basePath.toLowerCase().startsWith(prefix));
}

export async function prepareReadme(readme: string, autoGenConfig: AutoGenConfig) {
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