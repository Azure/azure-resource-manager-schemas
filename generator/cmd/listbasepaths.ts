import * as constants from '../constants';
import { cloneAndGenerateBasePaths } from '../specs';
import chalk from 'chalk';
import { isWhitelisted } from '../whitelist';
import { executeSynchronous } from '../utils';

executeSynchronous(async () => {
    const basePaths = await cloneAndGenerateBasePaths(constants.specsRepoPath, constants.specsRepoUri, constants.specsRepoCommitHash);

    for (const basePath of basePaths) {
        console.log(`Discovered '${chalk.green(basePath)}'. Whitelisted for auto-generation: ${isWhitelisted(basePath) ? chalk.green('yes') : chalk.red('no')}.`);
    }
});