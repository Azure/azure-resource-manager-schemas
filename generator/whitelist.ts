import { ScopeType, WhitelistConfig } from './models';

// Run "npm run list-basepaths" to discover all the valid readme files to add to this list
const whitelist: WhitelistConfig[] = [
    {
        basePath: 'botservice/resource-manager',
        namespace: 'Microsoft.BotService',
    },
    { 
        basePath: 'cognitiveservices/resource-manager',
        namespace: 'Microsoft.CognitiveServices',
    },
    { 
        basePath: 'containerinstance/resource-manager',
        namespace: 'Microsoft.ContainerInstance',
    },
    {
        basePath: 'cosmos-db/resource-manager',
        namespace: 'Microsoft.DocumentDB',
    },
    {
        basePath: 'databox/resource-manager',
        namespace: 'Microsoft.DataBox',
    },
    {
        basePath: 'databoxedge/resource-manager',
        namespace: 'Microsoft.DataBoxEdge',
    },
    {
        basePath: 'databricks/resource-manager',
        namespace: 'Microsoft.Databricks',
    },
    {
        basePath: 'deploymentmanager/resource-manager',
        namespace: 'Microsoft.DeploymentManager',
    },
    {
        basePath: 'devspaces/resource-manager',
        namespace: 'Microsoft.DevSpaces',
    },
    {
        basePath: 'devtestlab/resource-manager',
        namespace: 'Microsoft.DevTestLab',
    },
    { 
        basePath: 'hdinsight/resource-manager',
        namespace: 'Microsoft.HDInsight',
    },
    {
        basePath: 'EnterpriseKnowledgeGraph/resource-manager',
        namespace: 'Microsoft.EnterpriseKnowledgeGraph',
    },
    { 
        basePath: 'domainservices/resource-manager',
        namespace: 'Microsoft.AAD',
    },
    {
        basePath: 'eventhub/resource-manager',
        namespace: 'Microsoft.EventHub',
    },
    {
        basePath: 'iothub/resource-manager',
        namespace: 'Microsoft.Devices',
    },
    {
        basePath: 'iotspaces/resource-manager',
        namespace: 'Microsoft.IoTSpaces',
    },
    {
        basePath: 'labservices/resource-manager',
        namespace: 'Microsoft.LabServices',
    },
    {
        basePath: 'machinelearningcompute/resource-manager',
        namespace: 'Microsoft.MachineLearningCompute',
    },
    { 
        basePath: 'mariadb/resource-manager',
        namespace: 'Microsoft.DBforMariaDB',
    },
    { 
        basePath: 'mysql/resource-manager',
        namespace: 'Microsoft.DBforMySQL',
    },
    {
        basePath: 'policyinsights/resource-manager',
        namespace: 'Microsoft.PolicyInsights',
    },
    { 
        basePath: 'peering/resource-manager',
        namespace: 'Microsoft.Peering',
    },
    {
        basePath: 'portal/resource-manager',
        namespace: 'Microsoft.Portal',
    },
    {
        basePath: 'postgresql/resource-manager',
        namespace: 'Microsoft.DBforPostgreSQL',
    },
    {
        basePath: 'relay/resource-manager',
        namespace: 'Microsoft.Relay',
    },
    {
        basePath: 'servicebus/resource-manager',
        namespace: 'Microsoft.ServiceBus',
    },
    {
        basePath: 'servicefabric/resource-manager',
        namespace: 'Microsoft.ServiceFabric',
    },
    {
        basePath: 'servicefabricmesh/resource-manager',
        namespace: 'Microsoft.ServiceFabricMesh',
    },
    {
        basePath: 'sqlvirtualmachine/resource-manager',
        namespace: 'Microsoft.SqlVirtualMachine',
    },
    {
        basePath: 'storagesync/resource-manager',
        namespace: 'Microsoft.StorageSync',
    },
    { 
        basePath: 'vmwarecloudsimple/resource-manager',
        namespace: 'Microsoft.VMwareCloudSimple',
    },
    {
        basePath: 'windowsiot/resource-manager',
        namespace: 'Microsoft.WindowsIoT',
    }
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