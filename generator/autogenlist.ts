import { ScopeType, AutogenlistConfig } from './models';
import { postProcessor as resourcesPostProcessor } from './processors/Microsoft.Resources';
import { postProcessor as machineLearningPostProcessor } from './processors/Microsoft.MachineLearning';
import { lowerCaseEquals } from './utils';

// Run "npm run list-basepaths" to discover all the valid readme files to add to this list
const autogenlist: AutogenlistConfig[] = [
    {
        basePath: 'addons/resource-manager',
        namespace: 'Microsoft.Addons',
    },
    {
        basePath: 'adhybridhealthservice/resource-manager',
        namespace: 'Microsoft.ADHybridHealthService',
    },
    {
        basePath: 'cdn/resource-manager',
        namespace: 'Microsoft.Cdn',
    },
    {
        basePath: 'analysisservices/resource-manager',
        namespace: 'Microsoft.AnalysisServices',
    },
    {
        basePath: 'azureactivedirectory/resource-manager',
        namespace: 'Microsoft.Aadiam',
    },
    {
        basePath: 'alertsmanagement/resource-manager',
        namespace: 'Microsoft.AlertsManagement',
    },
    {
        basePath: 'workloadmonitor/resource-manager',
        namespace: 'Microsoft.WorkloadMonitor',
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
        basePath: 'blueprint/resource-manager',
        namespace: 'Microsoft.Blueprint',
        resourceConfig: [
            {
                type: 'blueprintAssignments',
                scopes: ScopeType.Subcription | ScopeType.ManagementGroup,
            },
            {
                type: 'blueprints',
                scopes: ScopeType.Subcription | ScopeType.ManagementGroup,
            },
            {
                type: 'blueprints/artifacts',
                scopes: ScopeType.Subcription | ScopeType.ManagementGroup,
            },
            {
                type: 'blueprints/versions',
                scopes: ScopeType.Subcription | ScopeType.ManagementGroup,
            },
        ]
    },
    {
        basePath: 'botservice/resource-manager',
        namespace: 'Microsoft.BotService',
    },
    {
        basePath: 'billing/resource-manager',
        namespace: 'Microsoft.Billing',
    },
    {
        basePath: 'changeanalysis/resource-manager',
        namespace: 'Microsoft.ChangeAnalysis',
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
        basePath: 'customerlockbox/resource-manager',
        namespace: 'Microsoft.CustomerLockbox',
    },
    {
        basePath: 'containerservice/resource-manager',
        namespace: 'Microsoft.ContainerService',
    },
    {
        basePath: 'commerce/resource-manager',
        namespace: 'Microsoft.Commerce',
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
        basePath: 'datacatalog/resource-manager',
        namespace: 'Microsoft.DataCatalog',
    },
    {
        basePath: 'datalake-analytics/resource-manager',
        namespace: 'Microsoft.DataLakeAnalytics',
    },
    {
        basePath: 'datalake-store/resource-manager',
        namespace: 'Microsoft.DataLakeStore',
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
        basePath: 'desktopvirtualization/resource-manager',
        namespace: 'Microsoft.DesktopVirtualization',
    },
    {
      basePath: 'digitaltwins/resource-manager',
      namespace: 'Microsoft.DigitalTwins',
      resourceConfig: [
          {
              type: 'integrationResources',
              scopes: ScopeType.Extension,
          }
      ]
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
        basePath: 'guestconfiguration/resource-manager',
        namespace: 'Microsoft.GuestConfiguration',
    },
    {
        basePath: 'resourcegraph/resource-manager',
        namespace: 'Microsoft.ResourceGraph',
    },
    {
        basePath: 'redis/resource-manager',
        namespace: 'Microsoft.Cache',
    },
    {
        basePath: 'hardwaresecuritymodules/resource-manager',
        namespace: 'Microsoft.HardwareSecurityModules',
    },
    {
        basePath: 'hdinsight/resource-manager',
        namespace: 'Microsoft.HDInsight',
    },
    {
        basePath: 'resourcehealth/resource-manager',
        namespace: 'Microsoft.ResourceHealth',
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
        basePath: 'engagementfabric/resource-manager',
        namespace: 'Microsoft.EngagementFabric',
    },
    {
        basePath: 'frontdoor/resource-manager',
        namespace: 'Microsoft.Network',
        suffix: 'FrontDoor',
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
        basePath: 'intune/resource-manager',
        namespace: 'Microsoft.Intune',
    },
    {
        basePath: 'labservices/resource-manager',
        namespace: 'Microsoft.LabServices',
    },
    {
        basePath: 'eventgrid/resource-manager',
        namespace: 'Microsoft.EventGrid',
        resourceConfig: [
            {
                type: 'eventSubscriptions',
                scopes: ScopeType.Extension | ScopeType.Subcription | ScopeType.ResourceGroup,
            },
        ],
    },
    {
        basePath: 'machinelearning/resource-manager',
        namespace: 'Microsoft.MachineLearning',
        postProcessor: machineLearningPostProcessor,
    },
    {
        basePath: 'machinelearningcompute/resource-manager',
        namespace: 'Microsoft.MachineLearningCompute',
    },
    {
        basePath: 'machinelearningexperimentation/resource-manager',
        namespace: 'Microsoft.MachineLearningExperimentation',
    },
    {
        basePath: 'maintenance/resource-manager',
        namespace: 'Microsoft.Maintenance',
    },
    {
        basePath: 'migrate/resource-manager',
        namespace: 'Microsoft.Migrate',
    },
    {
        basePath: 'migrate/resource-manager',
        namespace: 'Microsoft.OffAzure',
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
        basePath: 'migrateprojects/resource-manager',
        namespace: 'Microsoft.Migrate',
    },
    {
        basePath: 'mariadb/resource-manager',
        namespace: 'Microsoft.DBforMariaDB',
    },
    {
        basePath: 'marketplace/resource-manager',
        namespace: 'Microsoft.Marketplace',
    },
    {
        basePath: 'machinelearningservices/resource-manager',
        namespace: 'Microsoft.MachineLearningServices',
    },
    {
        basePath: 'mysql/resource-manager',
        namespace: 'Microsoft.DBforMySQL',
    },
    {
        basePath: 'managementgroups/resource-manager',
        namespace: 'Microsoft.Management',
    },
    {
        basePath: 'managementpartner/resource-manager',
        namespace: 'Microsoft.ManagementPartner',
    },
    {
        basePath: 'maps/resource-manager',
        namespace: 'Microsoft.Maps',
    },
    {
        basePath: 'netapp/resource-manager',
        namespace: 'Microsoft.NetApp',
    },
    {
      basePath: 'notificationhubs/resource-manager',
      namespace: 'Microsoft.NotificationHubs'
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
        basePath: 'powerbidedicated/resource-manager',
        namespace: 'Microsoft.PowerBIDedicated',
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
        basePath: 'powerbiembedded/resource-manager',
        namespace: 'Microsoft.PowerBI',
    },
    {
        basePath: 'redhatopenshift/resource-manager',
        namespace: 'Microsoft.RedHatOpenShift',
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
        basePath: 'reservations/resource-manager',
        namespace: 'Microsoft.Capacity',
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
        basePath: 'signalr/resource-manager',
        namespace: 'Microsoft.SignalRService',
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
        basePath: 'streamanalytics/resource-manager',
        namespace: 'Microsoft.StreamAnalytics',
    },
    {
        basePath: 'storagesync/resource-manager',
        namespace: 'Microsoft.StorageSync',
    },
    {
        basePath: 'serialconsole/resource-manager',
        namespace: 'Microsoft.SerialConsole',
    },
    {
        basePath: 'synapse/resource-manager',
        namespace: 'Microsoft.Synapse',
    },
    {
        basePath: 'securityinsights/resource-manager',
        namespace: 'Microsoft.SecurityInsights',
    },
    {
        basePath: 'storageimportexport/resource-manager',
        namespace: 'Microsoft.ImportExport'
    },
    {
        basePath: 'storSimple1200Series/resource-manager',
        namespace: 'Microsoft.StorSimple',
        suffix: '1200'
    },
    {
        basePath: 'vmwarecloudsimple/resource-manager',
        namespace: 'Microsoft.VMwareCloudSimple',
    },
    {
        basePath: 'visualstudio/resource-manager',
        namespace: 'Microsoft.VisualStudio',
    },
    {
        basePath: 'sql/resource-manager',
        namespace: 'Microsoft.Sql',
    },
    {
        basePath: 'scheduler/resource-manager',
        namespace: 'Microsoft.Scheduler',
    },
    {
        basePath: 'search/resource-manager',
        namespace: 'Microsoft.Search',
    },
    {
        basePath: 'subscription/resource-manager',
        namespace: 'Microsoft.Subscription',
    },
    {
        basePath: 'storsimple8000series/resource-manager',
        namespace: 'Microsoft.StorSimple',
        suffix: '8000',
    },
    {
        basePath: 'support/resource-manager',
        namespace: 'Microsoft.Support',
    },
    {
        basePath: 'softwareplan/resource-manager',
        namespace: 'Microsoft.SoftwarePlan',
        resourceConfig: [
            {
                type: 'hybridUseBenefits',
                scopes: ScopeType.Extension,
            },
        ]
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
        basePath: 'vmware/resource-manager',
        namespace: 'Microsoft.AVS',
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

export function getAutogenlist(): AutogenlistConfig[] {
    return autogenlist;
}

export function findAutogenEntries(basePath: string): AutogenlistConfig[] {
    return autogenlist.filter(w => lowerCaseEquals(w.basePath, basePath));
}

export function findAutogenEntriesByNamespace(namespace: string): AutogenlistConfig {
    const autogenlistConfig = autogenlist.filter(w => lowerCaseEquals(w.namespace, namespace));
    if (autogenlistConfig.length !== 1) {
        throw new Error(`Namespace ${namespace} has no or more than one AutogenlistConfig`);
    }
    return autogenlistConfig[0];
}
