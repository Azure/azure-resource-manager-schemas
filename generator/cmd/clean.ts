// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import * as constants from '../constants';
import { resetGitDirectory } from '../git';
import { executeSynchronous } from '../utils';

executeSynchronous(async () => {
    await resetGitDirectory(constants.specsRepoPath, true);

    await resetGitDirectory(constants.schemasBasePath, false);
});