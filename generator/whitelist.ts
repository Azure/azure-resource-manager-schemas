import { ScopeType, WhitelistConfig } from './models';

// Run "npm run list-basepaths" to discover all the valid readme files to add to this list
const whitelist: WhitelistConfig[] = [
    {
        basePath: 'alertsmanagement/resource-manager',
        namespace: 'Microsoft.AlertsManagement',
    },
    {
        basePath: 'attestation/resource-manager',
        namespace: 'Microsoft.Attestation',
    },
    {
        basePath: 'azuredata/resource-manager',
        namespace: 'Microsoft.AzureData',
    },
    { 
        basePath: 'batchai/resource-manager',
        namespace: 'Microsoft.BatchAI',
    },
    {
        basePath: 'blockchain/resource-manager',
        namespace: 'Microsoft.Blockchain',
    },
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
        basePath: 'containerregistry/resource-manager',
        namespace: 'Microsoft.ContainerRegistry',
    },
    {
        basePath: 'customproviders/resource-manager',
        namespace: 'Microsoft.CustomProviders',
        resourceConfig: [
            {
                type: 'associations',
                scopes: ScopeType.Extension,
            },
        ],
    },
    {
        basePath: 'databox/resource-manager',
        namespace: 'Microsoft.DataBox',
    },
    { 
        basePath: 'operationalinsights/resource-manager',
        namespace: 'Microsoft.OperationalInsights',
    },
    {
        basePath: 'containerservice/resource-manager',
        namespace: 'Microsoft.ContainerService',
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
        basePath: 'datafactory/resource-manager',
        namespace: 'Microsoft.DataFactory',
    },
    {
        basePath: 'datalake-analytics/resource-manager',
        namespace: 'Microsoft.DataLakeAnalytics',
    },
    {
        basePath: 'datashare/resource-manager',
        namespace: 'Microsoft.DataShare',
    },
    {
        basePath: 'deploymentmanager/resource-manager',
        namespace: 'Microsoft.DeploymentManager',
    },
    {
        basePath: 'devops/resource-manager',
        namespace: 'Microsoft.DevOps',
    },
    {
        basePath: 'devspaces/resource-manager',
        namespace: 'Microsoft.DevSpaces',
    },
    {
        basePath: 'devtestlabs/resource-manager',
        namespace: 'Microsoft.DevTestLab',
    },
    { 
        basePath: 'redis/resource-manager',
        namespace: 'Microsoft.Cache',
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
        basePath: 'hanaonazure/resource-manager',
        namespace: 'Microsoft.HanaOnAzure',
    },
    {
        basePath: 'hybriddatamanager/resource-manager',
        namespace: 'Microsoft.HybridData',
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
        basePath: 'maintenance/resource-manager',
        namespace: 'Microsoft.Maintenance',
    },
    {
        basePath: 'managednetwork/resource-manager',
        namespace: 'Microsoft.ManagedNetwork',
        resourceConfig: [
            {
                type: 'scopeAssignments',
                scopes: ScopeType.Subcription,
            },
        ],
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
        basePath: 'netapp/resource-manager',
        namespace: 'Microsoft.NetApp',
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
        basePath: 'storagecache/resource-manager',
        namespace: 'Microsoft.StorageCache',
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
        basePath: 'sql/resource-manager',
        namespace: 'Microsoft.Sql',
    },
    {
        basePath: 'timeseriesinsights/resource-manager',
        namespace: 'Microsoft.TimeSeriesInsights',
    },
    {
        basePath: 'imagebuilder/resource-manager',
        namespace: 'Microsoft.VirtualMachineImages',
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