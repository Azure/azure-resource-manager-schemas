import * as constants from '../constants';
import { cloneAndGenerateBasePaths, validateAndReturnReadmePath } from '../specs';
import chalk from 'chalk';
import { findWhitelistEntries } from '../whitelist';
import { executeSynchronous, lowerCaseEquals } from '../utils';
import { getApiVersionsByNamespace } from '../generate';
import { keys, partition } from 'lodash';

executeSynchronous(async () => {
    const basePaths = await cloneAndGenerateBasePaths(constants.specsRepoPath, constants.specsRepoUri, constants.specsRepoCommitHash);

    for (const basePath of basePaths) {
        const readme = await validateAndReturnReadmePath(basePath);
        const namespaces = keys(await getApiVersionsByNamespace(readme));
        const whitelistEntries = findWhitelistEntries(basePath);

        const [whitelisted, unwhitelisted] = partition(
            namespaces,
            n => whitelistEntries.findIndex(w => lowerCaseEquals(w.namespace, n)) > -1);

        if (unwhitelisted.length === 0) {
            console.log(`Discovered '${chalk.green(basePath)}'. Whitelisted for auto-generation: ${chalk.green('yes')}.`);
        } else if (whitelisted.length > 0) {
            console.log(`Discovered '${chalk.green(basePath)}'. Whitelisted for auto-generation: ${chalk.yellow('partial')}. Missing: ${unwhitelisted.map(p => chalk.yellow(p)).join(', ')}.`);
        } else {
            console.log(`Discovered '${chalk.green(basePath)}'. Whitelisted for auto-generation: ${chalk.red('no')}. Missing: ${unwhitelisted.map(p => chalk.yellow(p)).join(', ')}.`);
        }
    }
});