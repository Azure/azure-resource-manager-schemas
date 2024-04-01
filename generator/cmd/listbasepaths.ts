// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { generateBasePaths, resolveAbsolutePath, validateAndReturnReadmePath } from '../specs';
import colors from 'colors';
import { findOrGenerateAutogenEntries } from '../autogenlist';
import { executeSynchronous } from '../utils';
import { partition } from 'lodash';
import yargs from 'yargs';

const argsConfig = yargs
  .strict()
  .option('specs-dir', { type: 'string', demandOption: true, desc: 'Path to the specs dir' });

executeSynchronous(async () => {
    const args = await argsConfig.parseAsync();

    const specsPath = await resolveAbsolutePath(args['specs-dir']);
    const basePaths = await generateBasePaths(specsPath);

    for (const basePath of basePaths) {
        const readme = validateAndReturnReadmePath(specsPath, basePath);
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