import { executeCmd, rmdirRecursive } from './utils';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

const exists = promisify(fs.exists);

async function resetGitDirectory(localPath: string) {
    await executeCmd(localPath, 'git', ['reset', '.']);
    await executeCmd(localPath, 'git', ['checkout', '--', '.']);
    await executeCmd(localPath, 'git', ['clean', '-fd']);
}

async function cloneGitRepo(localPath: string, remoteUri: string, commitHash: string) {
    localPath = path.resolve(localPath);

    let pathExists = false;
    try {
        await executeCmd(localPath, 'git', ['fsck']);
        pathExists = true;
    } catch {
        if (await exists(localPath)) {
            await rmdirRecursive(localPath);
        }
    }

    if (!pathExists) {
        await executeCmd(localPath, 'git', ['clone', remoteUri, localPath]);
    }

    await executeCmd(localPath, 'git', ['fetch']);
    await executeCmd(localPath, 'git', ['checkout', commitHash]);
}

export {
    resetGitDirectory,
    cloneGitRepo,
}