import * as constants from '../constants';
import { cloneAndGenerateBasePaths } from '../specs';
import { series } from 'async';
import { generateSchemasForReadme, listReadmePaths } from '../generate';

series([async () => {
    const basePaths = await cloneAndGenerateBasePaths(constants.specsRepoPath, constants.specsRepoUri, constants.specsRepoCommitHash);

    const readmes = await listReadmePaths(constants.specsRepoPath, basePaths);

    for (const readme of readmes) {
        await generateSchemasForReadme(readme);
    }
}]);