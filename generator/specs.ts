import path from 'path';
import os from 'os';
import fs from 'fs';
import { promisify } from 'util';
import { cloneGitRepo } from './git';
import { executeCmd, findRecursive } from './utils';
import * as constants from './constants';

const exists = promisify(fs.exists);
const npmBinary = os.platform() === 'win32' ? 'npm.cmd' : 'npm';

async function validateUserProvidedBasePath(basePath: string) {
    const readme = path.join(constants.specsRepoPath, 'specification', basePath, 'readme.enable-multi-api.md');

    if (!await exists(readme)) {
        throw new Error(`Unable to find readme '$readme' in specs repo`)
    }

    return readme;
}

async function cloneAndGenerateBasePaths(localPath: string, remoteUri: string, commitHash: string) {
    await cloneGitRepo(localPath, remoteUri, commitHash);

    await executeCmd(localPath, npmBinary, ['install']);
    await executeCmd(localPath, npmBinary, ['run', 'multiapi']);

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
        .map(p => p.substring(0, p.lastIndexOf(path.sep)))
        .map(getBasePathString.bind(null, localPath));
}

function getBasePathString(localPath: string, basePath: string) {
    return path
        .relative(path.join(localPath, 'specification'), basePath)
        .split(path.sep)
        .join('/');
}

function isWhitelisted(basePath: string) {
    return constants.whitelist.includes(basePath);
}

export {
    validateUserProvidedBasePath,
    cloneAndGenerateBasePaths,
    getBasePathString,
    isWhitelisted,
};