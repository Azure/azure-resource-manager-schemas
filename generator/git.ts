import { executeCmd, rmdirRecursive } from './utils';
import fs from 'fs';
import { promisify } from 'util';

const mkdir = promisify(fs.mkdir);
const exists = promisify(fs.exists);

export async function resetGitDirectory(localPath: string, includeGc: boolean) {
    if (await exists(localPath)) {
        await executeCmd(localPath, 'git', ['reset', '-q', '.']);
        await executeCmd(localPath, 'git', ['checkout', '-q', '--', '.']);
        await executeCmd(localPath, 'git', ['clean', '-q', '-fd']);

        if (includeGc) {
            await executeCmd(localPath, 'git', ['gc']);
        }
    }
}

export async function cloneGitRepo(localPath: string, remoteUri: string, commitHash: string) {
    try {
        await executeCmd(localPath, 'git', ['fsck']);
    } catch {
        await rmdirRecursive(localPath);
        await mkdir(localPath);
        await executeCmd(localPath, 'git', ['clone', remoteUri, localPath]);
    }

    await resetGitDirectory(localPath, true);

    await executeCmd(localPath, 'git', ['fetch', '-q']);
    await executeCmd(localPath, 'git', ['checkout', '-q', commitHash]);
}

export async function resetFile(localPath: string, fileName: string) {
    await executeCmd(localPath, 'git', ['checkout', '-q', '--', fileName]);
}
