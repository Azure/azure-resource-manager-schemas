import * as constants from '../constants';
import { getWhitelistedPaths, cloneAndGenerateBasePaths } from '../specs';
import { series } from 'async';
import chalk from 'chalk';

series([async () => {
    const basePaths = await cloneAndGenerateBasePaths(constants.specsRepoPath, constants.specsRepoUri, constants.specsRepoCommitHash);

    const whitelistedPaths = await getWhitelistedPaths(constants.specsRepoPath, basePaths);

    for (const basePath of basePaths) {
        const isWhitelisted = whitelistedPaths.includes(basePath)
    
        console.log(`Discovered '${chalk.green(basePath)}'. Whitelisted for auto-generation: ${isWhitelisted ? chalk.green('yes') : chalk.red('no')}.`);
    }
}]);