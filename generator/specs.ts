import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import { cloneGitRepo } from './git';
import { findRecursive } from './utils';
import * as constants from './constants'

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