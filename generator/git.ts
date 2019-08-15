import { executeCmd, rmdirRecursive } from './utils';
import fs from 'fs';
import { promisify } from 'util';

const mkdir = promisify(fs.mkdir);
const exists = promisify(fs.exists);

async function resetGitDirectory(localPath: string) {
    if (await exists(localPath)) {
        await executeCmd(localPath, 'git', ['reset', '-q', '.']);
        await executeCmd(localPath, 'git', ['checkout', '-q', '--', '.']);
        await executeCmd(localPath, 'git', ['clean', '-q', '-fd']);
    }
}

async function cloneGitRepo(localPath: string, remoteUri: string, commitHash: string) {
    try {
        await executeCmd(localPath, 'git', ['fsck']);
    } catch {
        await rmdirRecursive(localPath);
        await mkdir(localPath);
        await executeCmd(localPath, 'git', ['clone', remoteUri, localPath]);
    }

    await executeCmd(localPath, 'git', ['fetch']);
    await executeCmd(localPath, 'git', ['checkout', commitHash]);
}

export {
    resetGitDirectory,
    cloneGitRepo,
}