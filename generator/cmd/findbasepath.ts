import { executeSynchronous } from '../utils';
import { findAutogenEntries } from '../autogenlist';

// this function analyzes a branch name and extracts the base path, then proceeds to find it in autogenlist
// if not found, it throws an error
executeSynchronous(async () => {
    if (!process.argv[2]) {
        throw new Error("Branch name missing. This cmd expects a branch name with the following format: 'AzureSDKAutomation:sdkAutomation/[basepath]'");
    }
    
    const prName = process.argv[2];
    let basePath = prName.replace("sdkAutomation/", "");

    // format basePath
    basePath = `${basePath}/resource-manager`;

    const autogenEntries = findAutogenEntries(basePath);

    if (autogenEntries.length === 0) {
        //not found
        console.log("false");
        return;
    }

    console.log(`Base path: '${basePath} found in autogenlist.`);
    console.log("true");
});