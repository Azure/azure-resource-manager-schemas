import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import { cloneGitRepo } from './git';
import { findRecursive } from './utils';
import { ApiVersionFile, CodeBlock } from './models';
import * as constants from './constants'
import * as cm from '@ts-common/commonmark-to-markdown'
import * as yaml from 'js-yaml'

const exists = promisify(fs.exists);

export async function resolveAbsolutePath(localPath: string) {
    if (path.isAbsolute(localPath)) {
        return path.resolve(localPath);
    }
    return path.resolve(constants.generatorRoot, localPath);
}

export async function validateAndReturnReadmePath(localPath: string, basePath: string) {
    let readme = '';
    if (basePath.toLowerCase().endsWith('readme.md')) {
        readme = path.resolve(localPath, basePath);
    } else {
        readme = path.resolve(localPath, 'specification', basePath, 'readme.md')
    }

    if (!await exists(readme)) {
        throw new Error(`Unable to find readme '${readme}' in specs repo`);
    }

    return readme;
}

export async function cloneAndGenerateBasePaths(localPath: string, remoteUri: string, commitHash: string) {
    await cloneGitRepo(localPath, remoteUri, commitHash);

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
        .filter(p => !isBlocklisted(p));
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

function isBlocklisted(basePath: string) {
    return constants.blocklist.includes(basePath);
}

export async function getApiVersionFileList(readme: string): Promise<ApiVersionFile> {
    const content = fs.readFileSync(readme).toString();
    const markdownEx = cm.parse(content);
    const fileSet = new Set<string>();
    for (const codeBlock of cm.iterate(markdownEx.markDown)) {
        if (codeBlock.type === 'code_block' && codeBlock?.info?.startsWith('yaml') && codeBlock.literal !== null) {
            const DOC = (yaml.load(codeBlock.literal) as CodeBlock);
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
    }
    const result = {} as ApiVersionFile;

    return result;
}