import { ScopeType, WhitelistConfig } from './models';

// Run "npm run list-basepaths" to discover all the valid readme files to add to this list
const whitelist: WhitelistConfig[] = [
    {
        basePath: 'sqlvirtualmachine/resource-manager',
        namespace: 'Microsoft.SqlVirtualMachine',
    },
    {
        basePath: 'machinelearningcompute/resource-manager',
        namespace: 'Microsoft.MachineLearningCompute',
    },
    { 
        basePath: 'iotspaces/resource-manager',
        namespace: 'Microsoft.IoTSpaces',
    },
    { 
        basePath: 'botservice/resource-manager',
        namespace: 'Microsoft.BotService',
    },
    { 
        basePath: 'databox/resource-manager',
        namespace: 'Microsoft.DataBox',
    },
    { 
        basePath: 'windowsiot/resource-manager',
        namespace: 'Microsoft.WindowsIoT',
    },
    { 
        basePath: 'databricks/resource-manager',
        namespace: 'Microsoft.Databricks',
    },
    { 
        basePath: 'storagesync/resource-manager',
        namespace: 'Microsoft.StorageSync',
    },
    { 
        basePath: 'devspaces/resource-manager',
        namespace: 'Microsoft.DevSpaces',
    },
    { 
        basePath: 'policyinsights/resource-manager',
        namespace: 'Microsoft.PolicyInsights',
    },
    { 
        basePath: 'servicefabricmesh/resource-manager',
        namespace: 'Microsoft.ServiceFabricMesh',
    },
    { 
        basePath: 'labservices/resource-manager',
        namespace: 'Microsoft.LabServices',
    },
    { 
        basePath: 'EnterpriseKnowledgeGraph/resource-manager',
        namespace: 'Microsoft.EnterpriseKnowledgeGraph',
    },
    { 
        basePath: 'databoxedge/resource-manager',
        namespace: 'Microsoft.DataBoxEdge',
    },
    { 
        basePath: 'portal/resource-manager',
        namespace: 'Microsoft.Portal',
    },
    { 
        basePath: 'cosmos-db/resource-manager',
        namespace: 'Microsoft.DocumentDB',
    },
    { 
        basePath: 'servicefabric/resource-manager',
        namespace: 'Microsoft.ServiceFabric',
    },
    { 
        basePath: 'servicebus/resource-manager',
        namespace: 'Microsoft.ServiceBus',
    },
    { 
        basePath: 'eventhub/resource-manager',
        namespace: 'Microsoft.EventHub',
    },
    { 
        basePath: 'relay/resource-manager',
        namespace: 'Microsoft.Relay',
    },
    { 
        basePath: 'domainservices/resource-manager',
        namespace: 'Microsoft.AAD',
    },
];

function findWhitelistConfig(basePath: string) {
    const found = whitelist.find(w => w.basePath.toLowerCase() == basePath.toLowerCase());

    return found;
}

function isWhitelisted(basePath: string) {
    return findWhitelistConfig(basePath) !== undefined;
}

export {
    whitelist,
    isWhitelisted,
    findWhitelistConfig,
}