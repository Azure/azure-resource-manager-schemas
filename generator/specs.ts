// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import path from 'path';
import { findRecursive } from './utils';
import * as constants from './constants'
import { existsSync } from 'fs';

export async function resolveAbsolutePath(localPath: string) {
    if (path.isAbsolute(localPath)) {
        return path.resolve(localPath);
    }
    return path.resolve(constants.repoRoot, localPath);
}

export function validateAndReturnReadmePath(specsPath: string, basePath: string) {
    let readme = '';
    if (basePath.toLowerCase().endsWith('readme.md')) {
        readme = path.resolve(specsPath, basePath);
    } else {
        readme = path.resolve(specsPath, 'specification', basePath, 'readme.md')
    }

    if (!existsSync(readme)) {
        throw new Error(`Unable to find a readme under '${specsPath}' for base path '${basePath}'.`);
    }

    return readme;
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