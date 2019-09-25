import * as constants from '../constants';
import { cloneAndGenerateBasePaths, validateAndReturnReadmePath } from '../specs';
import { series } from 'async';
import { generateSchemas } from '../generate';
import process from 'process';
import { findWhitelistConfig } from '../whitelist';
import chalk from 'chalk';

series([async () => {
    const basePath = process.argv[2];
    await cloneAndGenerateBasePaths(constants.specsRepoPath, constants.specsRepoUri, constants.specsRepoCommitHash);

    let readme = '';
    try {
        readme = await validateAndReturnReadmePath(basePath);
    } catch {
        throw new Error(`Unable to find a readme under '${basePath}'. Please try running 'npm run list-basepaths' to find the list of valid paths.`);
    }

    const whitelistConfig = findWhitelistConfig(basePath);
    if (whitelistConfig) {
        console.log(`Using whitelist config:`)
        console.log(chalk.green(JSON.stringify(whitelistConfig, null, 2)));
    }

    await generateSchemas(readme, whitelistConfig);
}]);