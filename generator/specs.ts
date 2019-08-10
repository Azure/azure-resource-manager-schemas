import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import { cloneGitRepo } from './git';
import { executeCmd, findRecursive } from './utils';
import * as constants from './constants';

const exists = promisify(fs.exists);

async function validateUserProvidedBasePath(basePath: string) {
    const readme = path.join(constants.specsRepoPath, 'specification', basePath, 'readme.enable-multi-api.md');

    if (!await exists(readme)) {
        throw new Error(`Unable to find readme '$readme' in specs repo`)
    }

    return readme;
}

async function cloneAndGenerateBasePaths(localPath: string, remoteUri: string, commitHash: string) {
    await cloneGitRepo(localPath, remoteUri, commitHash);

    await executeCmd(localPath, 'npm', ['install']);
    await executeCmd(localPath, 'npm', ['run', 'multiapi']);

    const specsPath = path.join(localPath, 'specification');

    const filePaths = await findRecursive(specsPath, filePath => {
        if (path.basename(filePath) !== 'readme.enable-multi-api.md') {
            return false;
        }

        return filePath
            .split(path.sep)
            .some(parent => parent == 'resource-manager');
    });

    return filePaths
        .map(getBasePathString.bind(null, localPath))
        .map(p => p.substring(0, p.lastIndexOf(path.sep)))
        .map(p => p.split(path.sep).join('/'));
}

async function getWhitelistedPaths(localPath: string, basePaths: string[]) {
    const whitelistedPaths = constants.whitelist.map(path.normalize);
    basePaths = basePaths.map(path.normalize);

    return basePaths.filter(p => whitelistedPaths.includes(p));
}

function getBasePathString(localPath: string, basePath: string) {
    return path.relative(path.join(localPath, 'specification'), basePath);
}

export {
    validateUserProvidedBasePath,
    cloneAndGenerateBasePaths,
    getWhitelistedPaths,
    getBasePathString,
};