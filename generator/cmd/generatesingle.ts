import * as constants from '../constants';
import { cloneAndGenerateBasePaths, validateUserProvidedBasePath } from '../specs';
import { series } from 'async';
import { generateSchemasForReadme } from '../generate';
import process from 'process';

series([async () => {
    const basePath = process.argv[2];
    const basePaths = await cloneAndGenerateBasePaths(constants.specsRepoPath, constants.specsRepoUri, constants.specsRepoCommitHash);

    let readme = '';
    try {
        readme = await validateUserProvidedBasePath(basePath);
    } catch {
        throw new Error(`Unable to find a readme under '${basePath}'. Please try running 'npm run list-basepaths' to find the list of valid paths.`);
    }

    await generateSchemasForReadme(readme);
}]);