import { ScopeType, WhitelistConfig } from './models';
import { postProcessor as resourcesPostProcessor } from './processors/Microsoft.Resources';
import { lowerCaseEquals } from './utils';

// Run "npm run list-basepaths" to discover all the valid readme files to add to this list
const whitelist: WhitelistConfig[] = [
    {
        basePath: 'alertsmanagement/resource-manager',
        namespace: 'Microsoft.AlertsManagement',
    },
    {
        basePath: 'appconfiguration/resource-manager',
        namespace: 'Microsoft.AppConfiguration',
    },
    {
        basePath: 'apimanagement/resource-manager',
        namespace: 'Microsoft.ApiManagement',
    },
    {
        basePath: 'appplatform/resource-manager',
        namespace: 'Microsoft.AppPlatform',
    },
    {
        basePath: 'attestation/resource-manager',
        namespace: 'Microsoft.Attestation',
    },
    {
        basePath: 'automation/resource-manager',
        namespace: 'Microsoft.Automation',
    },
    {
        basePath: 'azuredata/resource-manager',
        namespace: 'Microsoft.AzureData',
    },
    {
        basePath: 'azurestack/resource-manager',
        namespace: 'Microsoft.AzureStack',
    },
    { 
        basePath: 'batch/resource-manager',
        namespace: 'Microsoft.Batch',
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
        basePath: 'consumption/resource-manager',
        namespace: 'Microsoft.Consumption',
        resourceConfig: [
            {
                type: 'budgets',
                scopes: ScopeType.Subcription | ScopeType.ResourceGroup | ScopeType.Extension,
            },
        ],
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
        basePath: 'deviceprovisioningservices/resource-manager',
        namespace: 'Microsoft.Devices',
        suffix: 'Provisioning',
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
        basePath: 'hybridcompute/resource-manager',
        namespace: 'Microsoft.HybridCompute',
    },
    {
        basePath: 'hybriddatamanager/resource-manager',
        namespace: 'Microsoft.HybridData',
    },
    {
        basePath: 'iotcentral/resource-manager',
        namespace: 'Microsoft.IotCentral',
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
        resourceConfig: [
            {
                type: 'remediations',
                scopes: ScopeType.Subcription | ScopeType.ResourceGroup | ScopeType.ManagementGroup,
            }
        ]
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
        basePath: 'resources/resource-manager',
        namespace: 'Microsoft.Resources',
        resourceConfig: [
            {
                type: 'deployments',
                scopes: ScopeType.Tenant | ScopeType.ManagementGroup | ScopeType.Subcription | ScopeType.ResourceGroup,
            },
            {
                type: 'tags',
                scopes: ScopeType.ManagementGroup | ScopeType.Subcription | ScopeType.ResourceGroup | ScopeType.Extension,
            },
        ],
        postProcessor: resourcesPostProcessor,
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
        basePath: 'windowsesu/resource-manager',
        namespace: 'Microsoft.WindowsESU',
    },
    {
        basePath: 'windowsiot/resource-manager',
        namespace: 'Microsoft.WindowsIoT',
    }
];

export function getWhitelist(): WhitelistConfig[] {
    return whitelist;
}

export function findWhitelistEntries(basePath: string): WhitelistConfig[] {
    return whitelist.filter(w => lowerCaseEquals(w.basePath, basePath));
}
