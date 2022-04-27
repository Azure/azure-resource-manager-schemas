// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { executeSynchronous } from '../utils';
import { findAutogenEntries } from '../autogenlist';

// this function analyzes a branch name and extracts the base path, then proceeds to find it in autogenlist
// if not found, it throws an error
executeSynchronous(async () => {
    if (process.argv.length < 4) {
        throw new Error("Branch name or Branch prefix missing. This cmd expects a branch name with the following format: branch name -> 'sdkAuto/[basepath]' and branch prefix -> 'sdkAuto/'");
    }
    
    const branchName = process.argv[2];
    const branchPrefix = process.argv[3];
    let basePath = branchName.replace(branchPrefix, "");

    // format basePath.
    basePath = `${basePath}/resource-manager`;

    const autoGenEntries = findAutogenEntries(basePath);

    if (autoGenEntries[0]?.disabledForAutogen === true) {
        // not onboarded in autogeneration
        console.log("false");
        return;
    }

    console.log(`Base path: '${basePath} is enabled (default) for autogen.`);
    console.log("true");
});
