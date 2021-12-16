// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { executeCmd, rmdirRecursive } from './utils';
import { existsSync } from 'fs';
import { mkdir } from 'fs/promises';

export async function resetGitDirectory(localPath: string, includeGc: boolean) {
    if (existsSync(localPath)) {
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
