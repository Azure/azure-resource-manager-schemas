// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { executeSynchronous } from '../utils';
import { findAutogenEntries } from '../autogenlist';

// this function analyzes a branch name and extracts the base path, then proceeds to find it in autogenlist
// if not found, it throws an error
executeSynchronous(async () => {
    if (!process.argv[2]) {
        throw new Error("Branch name missing. This cmd expects a branch name with the following format: 'sdkAutomation/[basepath]'");
    }
    
    const prName = process.argv[2];
    const prPrefix = process.argv[3];
    let basePath = prName.replace(prPrefix, "");

    // format basePath.
    basePath = `${basePath}/resource-manager`;

    const autoGenEntries = findAutogenEntries(basePath);

    if (autoGenEntries[0]?.disabledForAutogen === true) {
        // not onboarded in autogeneration
        console.log("false");
        return;
    }

    console.log(`Base path: '${basePath} found in autogenlist.`);
    console.log("true");
});
