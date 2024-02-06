// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import * as constants from '../constants';
import { cloneAndGenerateBasePaths, validateAndReturnReadmePath } from '../specs';
import colors from 'colors';
import { findOrGenerateAutogenEntries } from '../autogenlist';
import { executeSynchronous } from '../utils';
import { partition } from 'lodash';

executeSynchronous(async () => {
    const basePaths = await cloneAndGenerateBasePaths(constants.specsRepoPath, constants.specsRepoUri, constants.specsRepoCommitHash);

    for (const basePath of basePaths) {
        const readme = validateAndReturnReadmePath(constants.specsRepoPath, basePath);
        const autogenlistEntries = await findOrGenerateAutogenEntries(basePath, readme);

        const [unautogened, autogened] = partition(
            autogenlistEntries,
            e => e.disabledForAutogen === true);

        if (unautogened.length === 0) {
            console.log(`Discovered '${colors.green(basePath)}'. enabled for auto-generation: ${colors.green('yes')}.`);
        } else if (autogened.length > 0) {
            console.log(`Discovered '${colors.green(basePath)}'. enabled for auto-generation: ${colors.yellow('partial')}. Missing: ${unautogened.map(p => colors.yellow(p.namespace)).join(', ')}.`);
        } else {
            console.log(`Discovered '${colors.green(basePath)}'. enabled for auto-generation: ${colors.red('no')}. Missing: ${unautogened.map(p => colors.yellow(p.namespace)).join(', ')}.`);
        }
    }
});