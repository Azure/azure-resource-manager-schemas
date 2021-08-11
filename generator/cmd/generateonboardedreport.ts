import * as constants from '../constants';
import { cloneAndGenerateBasePaths, validateAndReturnReadmePath } from '../specs';
import chalk from 'chalk';
import { findOrGenerateAutogenEntries } from '../autogenlist';
import { executeSynchronous, lowerCaseEquals, writeJsonFile, safeMkdir } from '../utils';
import { getApiVersionsByNamespace } from '../generate';
import { keys, partition } from 'lodash';
import path from 'path';

executeSynchronous(async () => {
    const basePaths = await cloneAndGenerateBasePaths(constants.specsRepoPath, constants.specsRepoUri, constants.specsRepoCommitHash);

    let allBasePaths = [];

    for (const basePath of basePaths) {
        const readme = await validateAndReturnReadmePath(constants.specsRepoPath, basePath);
        const namespaces = keys(await getApiVersionsByNamespace(readme));
        const autogenlistEntries = findOrGenerateAutogenEntries(basePath, namespaces);

        const [unautogened, autogened] = partition(
            autogenlistEntries,
            e => e.disabledForAutogen === true);
        
        if (unautogened.length > 0 && autogened.length > 0) {
            // For partial autogeneration only, add two items
            // one item containing resource types not onboarded for autogeneration
            // and the other item containing resource types onboarded for autogeneration
            allBasePaths.push({
                'basePath': basePath,
                'onboardedToAutogen': 'no',
                'missing': unautogened.map(x => x.namespace),
                'onboarded': []
            });

            allBasePaths.push({
                'basePath': basePath,
                'onboardedToAutogen': 'yes',
                'missing': [],
                'onboarded': autogened.map(x => x.namespace)
            });
        }
        else {
            // unautogened.length === 0 means all resource types are onboarded for autogeneration
            allBasePaths.push({
                'basePath': basePath,
                'onboardedToAutogen': unautogened.length === 0 ? 'yes' : 'no',
                'missing': unautogened.map(x => x.namespace),
                'onboarded': []
            });
        }
    }

    const autogenResultPath = path.join(constants.autogenResultPath, 'result.json');
    await safeMkdir(constants.autogenResultPath);
    await writeJsonFile(autogenResultPath, allBasePaths);
});