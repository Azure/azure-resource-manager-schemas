import * as constants from '../constants';
import { resetGitDirectory } from '../git';
import { series } from 'async';

series([async () => {
    await resetGitDirectory(constants.specsRepoPath, true);

    await resetGitDirectory(constants.schemasBasePath, false);
}]);