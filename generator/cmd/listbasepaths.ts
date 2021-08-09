import * as constants from '../constants';
import { cloneAndGenerateBasePaths, validateAndReturnReadmePath } from '../specs';
import chalk from 'chalk';
import { findAutogenEntries } from '../autogenlist';
import { executeSynchronous, lowerCaseEquals } from '../utils';
import { getApiVersionsByNamespace } from '../generate';
import { keys, partition } from 'lodash';

executeSynchronous(async () => {
    const basePaths = await cloneAndGenerateBasePaths(constants.specsRepoPath, constants.specsRepoUri, constants.specsRepoCommitHash);

    for (const basePath of basePaths) {
        const readme = await validateAndReturnReadmePath(constants.specsRepoPath, basePath);
        const namespaces = keys(await getApiVersionsByNamespace(readme));
        const autogenlistEntries = findAutogenEntries(basePath);

        const [unautogened, autogened] = partition(
            namespaces,
            n => autogenlistEntries.filter(w => lowerCaseEquals(w.namespace, n))[0]?.disabledForAutogen === true);

        if (unautogened.length === 0) {
            console.log(`Discovered '${chalk.green(basePath)}'. enabled for auto-generation: ${chalk.green('yes')}.`);
        } else if (autogened.length > 0) {
            console.log(`Discovered '${chalk.green(basePath)}'. enabled for auto-generation: ${chalk.yellow('partial')}. Missing: ${unautogened.map(p => chalk.yellow(p)).join(', ')}.`);
        } else {
            console.log(`Discovered '${chalk.green(basePath)}'. enabled for auto-generation: ${chalk.red('no')}. Missing: ${unautogened.map(p => chalk.yellow(p)).join(', ')}.`);
        }
    }
});