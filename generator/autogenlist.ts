// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { ScopeType, AutoGenConfig } from './models';
import { postProcessor as insightsApplicationPostProcessor } from './processors/Microsoft.Insights.Application';
import { postProcessor as machineLearningPostProcessor } from './processors/Microsoft.MachineLearning';
import { postProcessor as kustoPostProcessor } from './processors/Microsoft.Kusto';
import { postProcessor as machineLearningServicesPostProcessor } from './processors/Microsoft.MachineLearningServices';
import { postProcessor as storageProcessor } from './processors/Microsoft.Storage';
import { postProcessor as computeProcessor } from './processors/Microsoft.Compute';
import { postProcessor as policyProcessor } from './processors/Microsoft.Authorization';
import { postProcessor as securityInsightsPostProcessor } from './processors/Microsoft.SecurityInsights';
import { postProcessor as costManagementPostProcessor } from './processors/Microsoft.CostManagement';
import { postProcessor as providerHubPostProcessor } from './processors/Microsoft.ProviderHub';
import { postProcessor as mediaPostProcessor } from './processors/Microsoft.Media';
import { postProcessor as networkPostProcessor } from './processors/Microsoft.Network';
import { postProcessor as azureStackHciPostProcessor } from './processors/Microsoft.AzureStackHCI';
import { postProcessor as resourcesPostProcessor } from './processors/Microsoft.Resources';
import { postProcessor as resourcesDeploymentsPostProcessor } from './processors/Microsoft.Resources.Deployments';
import { postProcessor as serviceFabricPostProcessor } from './processors/Microsoft.ServiceFabric';
import { postProcessor as awsConnectorPostProcessor } from './processors/Microsoft.AwsConnector';
import { lowerCaseEquals } from './utils';
import { detectProviderNamespaces } from './generate';

// New providers are onboarded by default. The providers listed here are the only ones **not** onboarded.
const disabledProviders: AutoGenConfig[] = [
    {
        // Need to be very careful - Microsoft.Logic are heavily dependent on Export Template, and are sensitive to properties being removed unintentionally
        basePath: 'logic/resource-manager/Microsoft.Logic/Logic',
        namespace: 'Microsoft.Logic',
        useNamespaceFromConfig: true,
        disabledForAutogen: true,
    },
    {
        // NRP generates many files and causes disk space issues during schema generation
        basePath: 'network/resource-manager',
        namespace: 'Microsoft.Network',
        postProcessor: networkPostProcessor,
        suffix: 'NRP',
        disabledForAutogen: true,
    },
    {
        //Disabled until errors are fixed
        //'datamanagerforagriculturesolutionproperties.properties.openapispecsdictionary.additionalproperties' - TypeError: Cannot convert undefined or null to object
        basePath: 'agrifood/resource-manager/Microsoft.AgFoodPlatform/AgFoodPlatform',
        namespace: 'Microsoft.AgFoodPlatform',
        useNamespaceFromConfig: true,
        disabledForAutogen: true,
    },
    {
        //Disabled until errors are fixed
        //Enum 'nextPartitionKey' cannot have a value ' ' that result in an empty name. Use x-ms-enum.values to specify the name of the values.
        //Enum 'nextRowKey' cannot have a value ' ' that result in an empty name. Use x-ms-enum.values to specify the name of the values.
        basePath: 'adhybridhealthservice/resource-manager/Microsoft.ADHybridHealthService/ADHybridHealthService',
        namespace: 'Microsoft.ADHybridHealthService',
        useNamespaceFromConfig: true,
        disabledForAutogen: true,
    },
    {
        //Disabled until errors are fixed
        //'specification/common-types/resource-management/v5/types.json' doesn't exists in workspace
        basePath: 'azurestackhci/resource-manager/Microsoft.AzureStackHCI/StackHCI',
        namespace: 'Microsoft.AzureStackHCI',
        useNamespaceFromConfig: true,
        suffix: 'StackHCI',
        disabledForAutogen: true,
    },
    {
        //Disabled until errors are fixed
        //'Microsoft.BotService/preview/2023-09-15-preview/botservice.json:3492:5' - TypeError: Cannot convert undefined or null to object
        basePath: 'botservice/resource-manager/Microsoft.BotService/BotService',
        namespace: 'Microsoft.BotService',
        useNamespaceFromConfig: true,
        disabledForAutogen: true,
    },
    {
        //Disabled until errors are fixed
        //Enum types of 'undefined' and format 'undefined' are not supported. Correct your input
        basePath: 'marketplacecatalog/resource-manager/Microsoft.Marketplace/Marketplace',
        namespace: 'stable',
        disabledForAutogen: true,
    },
    {
        //Disabled until errors are fixed
        basePath: 'servicefabricmanagedclusters/resource-manager/Microsoft.ServiceFabric/ServiceFabricManagedClusters',
        namespace: 'Microsoft.ServiceFabric',
        useNamespaceFromConfig: true,
        postProcessor: serviceFabricPostProcessor,
        suffix: 'ManagedClusters',
        disabledForAutogen: true,
    },
    {
        //Disabled until errors are fixed
        //Remove deprectaed version 2024-01-01-preview from readme
        basePath: 'monitor/resource-manager',
        namespace: 'Microsoft.Insights',
        disabledForAutogen: true,
    },
    {
        //Disabled until errors are fixed
        //Remove deprectaed version 2024-01-01-preview from readme
        basePath: 'monitor/resource-manager',
        namespace: 'Microsoft.Monitor',
        disabledForAutogen: true,
    },
    {
        //Disabled until errors are fixed
        //Password is not a valid format for type array
        basePath: 'redisenterprise/resource-manager/Microsoft.Cache/RedisEnterprise',
        namespace: 'Microsoft.Cache',
        useNamespaceFromConfig: true,
        disabledForAutogen: true,
    },
    {
        // Disabling as this is superceded by the 'securityinsights/resource-manager/Microsoft.SecurityInsights/SecurityInsights' entry after a repo restructure
        basePath: 'securityinsights/resource-manager',
        namespace: 'Microsoft.SecurityInsights',
        disabledForAutogen: true,
    },
    {
        //Disabling due to schema gen failure -  Not able to process media type */* at this moment.
        basePath: 'web/resource-manager/Microsoft.Web/AppService',
        useNamespaceFromConfig: true,
        namespace: 'Microsoft.Web',
        disabledForAutogen: true,
    },
];

// Run "npm run list-basepaths" to discover all the valid readme files to add to this list
const autoGenList: AutoGenConfig[] = [
    ...disabledProviders,
    {
        basePath: 'addons/resource-manager/Microsoft.Addons/Addons',
        namespace: 'Microsoft.Addons',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'authorization/resource-manager',
        namespace: 'Microsoft.Authorization',
        resourceConfig: [
            {
                type: 'roleAssignments',
                scopes: ScopeType.Extension | ScopeType.ManagementGroup | ScopeType.ResourceGroup | ScopeType.Subscription | ScopeType.Tenant
            },
            {
                type: 'roleDefinitions',
                scopes: ScopeType.Extension | ScopeType.ManagementGroup | ScopeType.ResourceGroup | ScopeType.Subscription | ScopeType.Tenant
            },
            {
                type: 'roleAssignmentScheduleRequests',
                scopes: ScopeType.Extension | ScopeType.ManagementGroup | ScopeType.ResourceGroup | ScopeType.Subscription | ScopeType.Tenant
            },
            {
                type: 'roleEligibilityScheduleRequests',
                scopes: ScopeType.Extension | ScopeType.ManagementGroup | ScopeType.ResourceGroup | ScopeType.Subscription | ScopeType.Tenant
            },
            {
                type: 'roleManagementPolicyAssignments',
                scopes: ScopeType.Extension | ScopeType.ManagementGroup | ScopeType.ResourceGroup | ScopeType.Subscription | ScopeType.Tenant
            },
            {
                type: 'roleAssignmentApprovals/stages',
                scopes: ScopeType.Tenant
            },
            {
                type: 'accessReviewHistoryDefinitions',
                scopes: ScopeType.Extension | ScopeType.ManagementGroup | ScopeType.ResourceGroup | ScopeType.Subscription | ScopeType.Tenant
            },
            {
                type: 'accessReviewScheduleDefinitions',
                scopes: ScopeType.Extension | ScopeType.ManagementGroup | ScopeType.ResourceGroup | ScopeType.Subscription | ScopeType.Tenant
            },
            {
                type: 'accessReviewScheduleDefinitions/instances',
                scopes: ScopeType.Extension | ScopeType.ManagementGroup | ScopeType.ResourceGroup | ScopeType.Subscription | ScopeType.Tenant
            },
            {
                type: 'accessReviewScheduleSettings',
                scopes: ScopeType.Extension | ScopeType.ManagementGroup | ScopeType.ResourceGroup | ScopeType.Subscription | ScopeType.Tenant
            },
        ],
        suffix: 'Authz'
    },
    {
        basePath: 'analysisservices/resource-manager',
        namespace: 'Microsoft.AnalysisServices',
    },
    {
        basePath: 'azureactivedirectory/resource-manager/Microsoft.Aadiam/AzureActiveDirectory',
        namespace: 'Microsoft.Aadiam',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'alertsmanagement/resource-manager/Microsoft.AlertsManagement/AlertProcessingRules',
        namespace: 'Microsoft.AlertsManagement',
        useNamespaceFromConfig: true,
        suffix: 'AlertProcessingRules',
    },
    {
        basePath: 'alertsmanagement/resource-manager/Microsoft.AlertsManagement/AlertsManagement',
        namespace: 'Microsoft.AlertsManagement',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'alertsmanagement/resource-manager/Microsoft.AlertsManagement/Legacy',
        namespace: 'Microsoft.AlertsManagement',
        useNamespaceFromConfig: true,
        suffix: 'Legacy',
    },
    {
        basePath: 'alertsmanagement/resource-manager/Microsoft.AlertsManagement/PrometheusRuleGroups',
        namespace: 'Microsoft.AlertsManagement',
        useNamespaceFromConfig: true,
        suffix: 'PrometheusRuleGroups',
    },
    {
        basePath: 'alertsmanagement/resource-manager/Microsoft.AlertsManagement/TenantActivityLogAlerts',
        namespace: 'Microsoft.AlertsManagement',
        useNamespaceFromConfig: true,
        suffix: 'TenantActivityLogAlerts',
    },
    {
        basePath: 'workloadmonitor/resource-manager/Microsoft.WorkloadMonitor/WorkloadMonitor',
        namespace: 'Microsoft.WorkloadMonitor',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'appconfiguration/resource-manager/Microsoft.AppConfiguration/AppConfiguration',
        namespace: 'Microsoft.AppConfiguration',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'apimanagement/resource-manager/Microsoft.ApiManagement/ApiManagement',
        namespace: 'Microsoft.ApiManagement',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'appplatform/resource-manager',
        namespace: 'Microsoft.AppPlatform',
    },
    {
        basePath: 'attestation/resource-manager/Microsoft.Attestation/Attestation',
        namespace: 'Microsoft.Attestation',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'automation/resource-manager',
        namespace: 'Microsoft.Automation',
    },
    {
        basePath: 'awsconnector/resource-manager',
        namespace: 'Microsoft.AwsConnector',
        postProcessor: awsConnectorPostProcessor
    },
    {
        basePath: 'azurearcdata/resource-manager',
        namespace: 'Microsoft.AzureArcData',
    },
    {
        basePath: 'azuredata/resource-manager/Microsoft.AzureData/AzureData',
        namespace: 'Microsoft.AzureData',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'azurestack/resource-manager/Microsoft.AzureStack/AzureStack',
        namespace: 'Microsoft.AzureStack',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'batch/resource-manager',
        namespace: 'Microsoft.Batch',
    },
    {
        basePath: 'blockchain/resource-manager',
        namespace: 'Microsoft.Blockchain',
    },
    {
        basePath: 'blueprint/resource-manager/Microsoft.Blueprint/Blueprint',
        namespace: 'Microsoft.Blueprint',
        useNamespaceFromConfig: true,
        resourceConfig: [
            {
                type: 'blueprintAssignments',
                scopes: ScopeType.Subscription | ScopeType.ManagementGroup,
            },
            {
                type: 'blueprints',
                scopes: ScopeType.Subscription | ScopeType.ManagementGroup,
            },
            {
                type: 'blueprints/artifacts',
                scopes: ScopeType.Subscription | ScopeType.ManagementGroup,
            },
            {
                type: 'blueprints/versions',
                scopes: ScopeType.Subscription | ScopeType.ManagementGroup,
            },
        ]
    },
    {
        basePath: 'billing/resource-manager/Microsoft.Billing/Billing',
        namespace: 'Microsoft.Billing',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'changeanalysis/resource-manager/Microsoft.ChangeAnalysis/ChangeAnalysis',
        namespace: 'Microsoft.ChangeAnalysis',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'cognitiveservices/resource-manager',
        namespace: 'Microsoft.CognitiveServices',
    },
    {
        basePath: 'communication/resource-manager',
        namespace: 'Microsoft.Communication',
    },
    {
        basePath: 'containerinstance/resource-manager/Microsoft.ContainerInstance/ContainerInstance',
        namespace: 'Microsoft.ContainerInstance',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'cosmos-db/resource-manager/Microsoft.DocumentDB/DocumentDB',
        namespace: 'Microsoft.DocumentDB',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'containerregistry/resource-manager/Microsoft.ContainerRegistry/Registry',
        namespace: 'Microsoft.ContainerRegistry',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'containerregistry/resource-manager/Microsoft.ContainerRegistry/RegistryTasks',
        namespace: 'Microsoft.ContainerRegistry',
        useNamespaceFromConfig: true,
        suffix: 'RegistryTasks',
    },
    {
        basePath: 'customproviders/resource-manager/Microsoft.CustomProviders/CustomProviders',
        namespace: 'Microsoft.CustomProviders',
        useNamespaceFromConfig: true,
        resourceConfig: [
            {
                type: 'associations',
                scopes: ScopeType.Extension,
            },
        ],
    },
    {
        basePath: 'databox/resource-manager/Microsoft.DataBox/DataBox',
        namespace: 'Microsoft.DataBox',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'consumption/resource-manager/Microsoft.Consumption/Consumption',
        namespace: 'Microsoft.Consumption',
        useNamespaceFromConfig: true,
        resourceConfig: [
            {
                type: 'budgets',
                scopes: ScopeType.Subscription | ScopeType.ResourceGroup | ScopeType.Extension,
            },
        ],
    },
    {
        basePath: 'cost-management/resource-manager/Microsoft.CostManagement/CostManagement',
        namespace: 'Microsoft.CostManagement',
        useNamespaceFromConfig: true,
        resourceConfig: [
            {
                type: 'exports',
                scopes: ScopeType.ManagementGroup | ScopeType.Subscription | ScopeType.ResourceGroup,
            },
            {
                type: 'budgets',
                scopes: ScopeType.ManagementGroup | ScopeType.Subscription | ScopeType.ResourceGroup | ScopeType.Extension,
            },
            {
                type: 'views',
                scopes: ScopeType.Tenant | ScopeType.ManagementGroup | ScopeType.Subscription | ScopeType.ResourceGroup | ScopeType.Extension,
            },
            {
                type: 'scheduledActions',
                scopes: ScopeType.Tenant | ScopeType.Subscription | ScopeType.ResourceGroup | ScopeType.Extension,
            },
            {
                type: 'benefitRecommendations',
                scopes: ScopeType.Subscription | ScopeType.ResourceGroup | ScopeType.Extension,
            },
            {
                type: 'benefitUtilizationSummaries',
                scopes: ScopeType.Subscription | ScopeType.ResourceGroup | ScopeType.Extension,
            },
            {
                type: 'generateCostDetailsReport',
                scopes: ScopeType.Subscription | ScopeType.Extension,
            },
            {
                type: 'alerts',
                scopes: ScopeType.ManagementGroup | ScopeType.Subscription | ScopeType.ResourceGroup | ScopeType.Extension,
            },
            {
                type: 'forecast',
                scopes: ScopeType.ManagementGroup | ScopeType.Subscription | ScopeType.ResourceGroup | ScopeType.Extension,
            },
            {
                type: 'dimensions',
                scopes: ScopeType.ManagementGroup | ScopeType.Subscription | ScopeType.ResourceGroup | ScopeType.Extension,
            },
            {
                type: 'query',
                scopes: ScopeType.ManagementGroup | ScopeType.Subscription | ScopeType.ResourceGroup | ScopeType.Extension,
            },
            {
                type: 'settings',
                scopes: ScopeType.Subscription | ScopeType.Extension,
            },
            {
                type: 'pricesheets',
                scopes: ScopeType.Extension
            }
        ],
        postProcessor: costManagementPostProcessor,
    },
    {
        basePath: 'customerlockbox/resource-manager',
        namespace: 'Microsoft.CustomerLockbox',
    },
    {
        basePath: 'commerce/resource-manager',
        namespace: 'Microsoft.Commerce',
    },
    {
        basePath: 'databoxedge/resource-manager/Microsoft.DataBoxEdge/DataBoxEdge',
        namespace: 'Microsoft.DataBoxEdge',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'databricks/resource-manager/Microsoft.Databricks/Databricks',
        namespace: 'Microsoft.Databricks',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'datafactory/resource-manager/Microsoft.DataFactory/DataFactory',
        namespace: 'Microsoft.DataFactory',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'datacatalog/resource-manager/Microsoft.DataCatalog/DataCatalog',
        namespace: 'Microsoft.DataCatalog',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'datalake-analytics/resource-manager',
        namespace: 'Microsoft.DataLakeAnalytics',
    },
    {
        basePath: 'datalake-store/resource-manager/Microsoft.DataLakeStore/DataLakeStore',
        namespace: 'Microsoft.DataLakeStore',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'datashare/resource-manager/Microsoft.DataShare/DataShare',
        namespace: 'Microsoft.DataShare',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'deploymentmanager/resource-manager',
        namespace: 'Microsoft.DeploymentManager',
    },
    {
        basePath: 'desktopvirtualization/resource-manager/Microsoft.DesktopVirtualization/DesktopVirtualization',
        namespace: 'Microsoft.DesktopVirtualization',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'digitaltwins/resource-manager/Microsoft.DigitalTwins/DigitalTwins',
        namespace: 'Microsoft.DigitalTwins',
        useNamespaceFromConfig: true,
        resourceConfig: [
            {
                type: 'integrationResources',
                scopes: ScopeType.Extension,
            }
        ]
    },
    {
        basePath: 'deviceprovisioningservices/resource-manager/Microsoft.Devices/DeviceProvisioningServices',
        namespace: 'Microsoft.Devices',
        useNamespaceFromConfig: true,
        suffix: 'Provisioning',
    },
    {
        basePath: 'devops/resource-manager/Microsoft.DevOps/DevOps',
        namespace: 'Microsoft.DevOps',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'devspaces/resource-manager/Microsoft.DevSpaces/DevSpaces',
        namespace: 'Microsoft.DevSpaces',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'devtestlabs/resource-manager/Microsoft.DevTestLab/DevTestLabs',
        namespace: 'Microsoft.DevTestLab',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'guestconfiguration/resource-manager/Microsoft.GuestConfiguration/Assignments',
        namespace: 'Microsoft.GuestConfiguration',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'resourcegraph/resource-manager',
        namespace: 'Microsoft.ResourceGraph',
    },
    {
        basePath: 'redis/resource-manager/Microsoft.Cache/Redis',
        namespace: 'Microsoft.Cache',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'redisenterprise/resource-manager',
        namespace: 'Microsoft.Cache',
        suffix: 'Enterprise'
    },
    {
        basePath: 'hardwaresecuritymodules/resource-manager/Microsoft.HardwareSecurityModules/HardwareSecurityModules',
        namespace: 'Microsoft.HardwareSecurityModules',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'hdinsight/resource-manager/Microsoft.HDInsight/HDInsight',
        namespace: 'Microsoft.HDInsight',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'resourcehealth/resource-manager/Microsoft.ResourceHealth/ResourceHealth',
        namespace: 'Microsoft.ResourceHealth',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'EnterpriseKnowledgeGraph/resource-manager',
        namespace: 'Microsoft.EnterpriseKnowledgeGraph',
    },
    {
        basePath: 'eventhub/resource-manager/Microsoft.EventHub/Eventhub',
        namespace: 'Microsoft.EventHub',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'engagementfabric/resource-manager/Microsoft.EngagementFabric/EngagementFabric',
        namespace: 'Microsoft.EngagementFabric',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'hanaonazure/resource-manager/Microsoft.HanaOnAzure/HanaOnAzure',
        namespace: 'Microsoft.HanaOnAzure',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'healthcareapis/resource-manager/Microsoft.HealthcareApis/HealthcareApis',
        namespace: 'Microsoft.HealthcareApis',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'hybridcompute/resource-manager/Microsoft.HybridCompute/HybridCompute',
        namespace: 'Microsoft.HybridCompute',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'hybridconnectivity/resource-manager',
        namespace: 'Microsoft.HybridConnectivity',
        resourceConfig: [
            {
                type: 'endpoints',
                scopes: ScopeType.Extension,
            }
        ]
    },
    {
        basePath: 'hybriddatamanager/resource-manager',
        namespace: 'Microsoft.HybridData',
    },
    {
        basePath: 'iotcentral/resource-manager/Microsoft.IoTCentral/IoTCentral',
        namespace: 'Microsoft.IotCentral',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'iothub/resource-manager/Microsoft.Devices/IoTHub',
        namespace: 'Microsoft.Devices',
        useNamespaceFromConfig: true,
        suffix: 'IoTHub',
    },
    {
        basePath: 'iotspaces/resource-manager',
        namespace: 'Microsoft.IoTSpaces',
    },
    {
        basePath: 'iotsecurity/resource-manager',
        namespace: 'Microsoft.IoTSecurity',
        resourceConfig: [
            {
                type: 'sensors',
                scopes: ScopeType.Extension,
            },
            {
                type: 'sites',
                scopes: ScopeType.Extension,
            }
        ]
    },
    {
        basePath: 'intune/resource-manager/Microsoft.Intune/Intune',
        namespace: 'Microsoft.Intune',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'labservices/resource-manager/Microsoft.LabServices/LabServices',
        namespace: 'Microsoft.LabServices',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'eventgrid/resource-manager/Microsoft.EventGrid/EventGrid',
        namespace: 'Microsoft.EventGrid',
        useNamespaceFromConfig: true,
        resourceConfig: [
            {
                type: 'eventSubscriptions',
                scopes: ScopeType.Extension | ScopeType.Subscription | ScopeType.ResourceGroup,
            },
        ],
    },
    {
        basePath: 'machinelearning/resource-manager',
        namespace: 'Microsoft.MachineLearning',
        postProcessor: machineLearningPostProcessor,
    },
    {
        basePath: 'azure-kusto/resource-manager/Microsoft.Kusto/Kusto',
        namespace: 'Microsoft.Kusto',
        useNamespaceFromConfig: true,
        postProcessor: kustoPostProcessor,
    },
    {
        basePath: 'machinelearningservices/resource-manager',
        namespace: 'Microsoft.MachineLearningServices',
        postProcessor: machineLearningServicesPostProcessor,
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
        basePath: 'maintenance/resource-manager/Microsoft.Maintenance/Maintenance',
        namespace: 'Microsoft.Maintenance',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'migrate/resource-manager/Microsoft.Migrate/AKSAssessments',
        namespace: 'Microsoft.Migrate',
        useNamespaceFromConfig: true,
        suffix: 'AKSAssessments'
    },
    {
        basePath: 'migrate/resource-manager/Microsoft.Migrate/AssessmentProjects',
        namespace: 'Microsoft.Migrate',
        useNamespaceFromConfig: true,
        suffix: 'AssessmentProjects'
    },
    {
        basePath: 'migrate/resource-manager/Microsoft.Migrate/AvsAssessments',
        namespace: 'Microsoft.Migrate',
        useNamespaceFromConfig: true,
        suffix: 'AvsAssessments'
    },
    {
        basePath: 'migrate/resource-manager/Microsoft.Migrate/BusinessCases',
        namespace: 'Microsoft.Migrate',
        useNamespaceFromConfig: true,
        suffix: 'BusinessCases'
    },
    {
        basePath: 'migrate/resource-manager/Microsoft.Migrate/Collectors',
        namespace: 'Microsoft.Migrate',
        useNamespaceFromConfig: true,
        suffix: 'Collectors'
    },
    {
        basePath: 'migrate/resource-manager/Microsoft.Migrate/HeterogenousAssessments',
        namespace: 'Microsoft.Migrate',
        useNamespaceFromConfig: true,
        suffix: 'HeterogenousAssessments'
    },
    {
        basePath: 'migrate/resource-manager/Microsoft.Migrate/MachineAssessments',
        namespace: 'Microsoft.Migrate',
        useNamespaceFromConfig: true,
        suffix: 'MachineAssessments'
    },
    {
        basePath: 'migrate/resource-manager/Microsoft.Migrate/MigrateProjects',
        namespace: 'Microsoft.Migrate',
        useNamespaceFromConfig: true,
        suffix: 'MigrateProjects'
    },
    {
        basePath: 'migrate/resource-manager/Microsoft.Migrate/MordernizeProjects',
        namespace: 'Microsoft.Migrate',
        useNamespaceFromConfig: true,
        suffix: 'MordernizeProjects'
    },
    {
        basePath: 'migrate/resource-manager/Microsoft.Migrate/SqlAssessments',
        namespace: 'Microsoft.Migrate',
        useNamespaceFromConfig: true,
        suffix: 'SqlAssessments'
    },
    {
        basePath: 'migrate/resource-manager/Microsoft.Migrate/Waves',
        namespace: 'Microsoft.Migrate',
        useNamespaceFromConfig: true,
        suffix: 'Waves'
    },
    {
        basePath: 'migrate/resource-manager/Microsoft.Migrate/WebAppAssessments',
        namespace: 'Microsoft.Migrate',
        useNamespaceFromConfig: true,
        suffix: 'WebAppAssessments'
    },
    {
        basePath: 'migrate/resource-manager/Microsoft.Migrate/WebAppCompoundAssessments',
        namespace: 'Microsoft.Migrate',
        useNamespaceFromConfig: true,
        suffix: 'WebAppCompoundAssessments'
    },
    {
        basePath: 'migrate/resource-manager/Microsoft.OffAzure',
        namespace: 'Microsoft.OffAzure',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'managednetwork/resource-manager/Microsoft.ManagedNetwork/ManagedNetwork',
        namespace: 'Microsoft.ManagedNetwork',
        useNamespaceFromConfig: true,
        resourceConfig: [
            {
                type: 'scopeAssignments',
                scopes: ScopeType.Subscription,
            },
        ],
    },
    {
        basePath: 'migrateprojects/resource-manager/Microsoft.Migrate/MigrateProjects',
        namespace: 'Microsoft.Migrate',
        useNamespaceFromConfig: true,
        suffix: 'MigrateProjects',
    },
    {
        basePath: 'resourcemover/resource-manager/Microsoft.Migrate/ResourceMover',
        namespace: 'Microsoft.Migrate',
        useNamespaceFromConfig: true,
        suffix: 'ResourceMover',
    },
    {
        basePath: 'mariadb/resource-manager',
        namespace: 'Microsoft.DBforMariaDB',
    },
    {
        basePath: 'marketplace/resource-manager/Microsoft.Marketplace/Marketplace',
        namespace: 'Microsoft.Marketplace',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'mysql/resource-manager/Microsoft.DBforMySQL/FlexibleServers',
        namespace: 'Microsoft.DBforMySQL',
        useNamespaceFromConfig: true,
        suffix: 'FlexibleServers',
    },
    {
        basePath: 'mysql/resource-manager/Microsoft.DBforMySQL/legacy',
        namespace: 'Microsoft.DBforMySQL',
        useNamespaceFromConfig: true,
        suffix: 'Legacy',
    },
    {
        basePath: 'management/resource-manager/Microsoft.Management/ManagementGroups',
        namespace: 'Microsoft.Management',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'managementpartner/resource-manager/Microsoft.ManagementPartner/ManagementPartner',
        namespace: 'Microsoft.ManagementPartner',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'maps/resource-manager/Microsoft.Maps/Maps',
        namespace: 'Microsoft.Maps',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'mixedreality/resource-manager',
        namespace: 'Microsoft.MixedReality',
    },
    {
        basePath: 'netapp/resource-manager/Microsoft.NetApp/NetApp',
        namespace: 'Microsoft.NetApp',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'notificationhubs/resource-manager/Microsoft.NotificationHubs/NotificationHubs',
        namespace: 'Microsoft.NotificationHubs',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'policyinsights/resource-manager',
        namespace: 'Microsoft.PolicyInsights',
        resourceConfig: [
            {
                type: 'remediations',
                scopes: ScopeType.Subscription | ScopeType.ResourceGroup | ScopeType.ManagementGroup,
            },
            {
                type: 'attestations',
                scopes: ScopeType.Subscription | ScopeType.ResourceGroup,
            }
        ]
    },
    {
        basePath: 'peering/resource-manager/Microsoft.Peering/Peering',
        namespace: 'Microsoft.Peering',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'powerbidedicated/resource-manager/Microsoft.PowerBIdedicated/PowerBIDedicated',
        namespace: 'Microsoft.PowerBIDedicated',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'portal/resource-manager',
        namespace: 'Microsoft.Portal',
    },
    {
        basePath: 'cloudshell/resource-manager/Microsoft.Portal/CloudShell',
        namespace: 'Microsoft.Portal',
        useNamespaceFromConfig: true,
        suffix: 'CloudShell',
    },
    {
        basePath: 'postgresql/resource-manager',
        namespace: 'Microsoft.DBforPostgreSQL',
    },
    {
        basePath: 'postgresqlhsc/resource-manager/Microsoft.DBforPostgreSQL/PostgresqlHsc',
        namespace: 'Microsoft.DBforPostgreSQL',
        useNamespaceFromConfig: true,
        suffix: 'Hsc',
    },
    {
        basePath: 'powerbiembedded/resource-manager/Microsoft.PowerBI/PowerbiEmbedded',
        namespace: 'Microsoft.PowerBI',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'providerhub/resource-manager',
        namespace: 'Microsoft.ProviderHub',
        postProcessor: providerHubPostProcessor
    },
    {
        basePath: 'quota/resource-manager/Microsoft.Quota/Quota',
        namespace: 'Microsoft.Quota',
        useNamespaceFromConfig: true,
        resourceConfig: [
            {
                type: 'quotaLimits',
                scopes: ScopeType.Extension,
            },
            {
                type: 'quotas',
                scopes: ScopeType.Extension,
            },
        ],
    },
    {
        basePath: 'redhatopenshift/resource-manager/Microsoft.RedHatOpenShift/OpenShiftClusters',
        namespace: 'Microsoft.RedHatOpenShift',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'resources/resource-manager/Microsoft.Resources/databoundaries',
        namespace: 'Microsoft.Resources',
        useNamespaceFromConfig: true,
        suffix: 'DataBoundaries',
        resourceConfig: [
            {
                type: 'dataBoundaries',
                scopes: ScopeType.Tenant | ScopeType.Subscription | ScopeType.ResourceGroup,
            },
        ],
    },
    {
        basePath: 'resources/resource-manager/Microsoft.Resources/resources',
        namespace: 'Microsoft.Resources',
        useNamespaceFromConfig: true,
        resourceConfig: [
            {
                type: 'tags',
                scopes: ScopeType.ManagementGroup | ScopeType.Subscription | ScopeType.ResourceGroup | ScopeType.Extension,
            },
        ],
        postProcessor: resourcesPostProcessor,
    },
    {
        basePath: 'resources/resource-manager/Microsoft.Resources/deployments',
        namespace: 'Microsoft.Resources',
        useNamespaceFromConfig: true,
        suffix: 'Deployments',
        resourceConfig: [
            {
                type: 'deployments',
                scopes: ScopeType.Tenant | ScopeType.ManagementGroup | ScopeType.Subscription | ScopeType.ResourceGroup,
            },
        ],
        postProcessor: resourcesDeploymentsPostProcessor,
    },
    {
        basePath: 'resources/resource-manager/Microsoft.Resources/deploymentStacks',
        namespace: 'Microsoft.Resources',
        useNamespaceFromConfig: true,
        suffix: 'DeploymentStacks'
    },
    {
        basePath: 'resources/resource-manager/Microsoft.Resources/deploymentScripts',
        namespace: 'Microsoft.Resources',
        useNamespaceFromConfig: true,
        suffix: 'DeploymentScripts'
    },
    {
        basePath: 'resources/resource-manager/Microsoft.Resources/templateSpecs',
        namespace: 'Microsoft.Resources',
        useNamespaceFromConfig: true,
        suffix: 'TemplateSpecs'
    },
    {
        basePath: 'resources/resource-manager/Microsoft.Resources/changes',
        namespace: 'Microsoft.Resources',
        useNamespaceFromConfig: true,
        suffix: 'Changes'
    },
    {
        basePath: 'resources/resource-manager/Microsoft.Resources/snapshots',
        namespace: 'Microsoft.Resources',
        useNamespaceFromConfig: true,
        suffix: 'Snapshots'
    },
    {
        basePath: 'resources/resource-manager/Microsoft.Authorization/locks',
        namespace: 'Microsoft.Authorization',
        useNamespaceFromConfig: true,
        suffix: 'Resources.Locks',
        resourceConfig: [
            {
                type: 'locks',
                scopes: ScopeType.Subscription | ScopeType.ResourceGroup | ScopeType.Extension,
            },
        ],
        postProcessor: policyProcessor
    },
    {
        basePath: 'resources/resource-manager/Microsoft.Authorization/policy',
        namespace: 'Microsoft.Authorization',
        useNamespaceFromConfig: true,
        suffix: 'Resources.Policy',
        resourceConfig: [
            {
                type: 'policyDefinitions',
                scopes: ScopeType.Tenant | ScopeType.ManagementGroup | ScopeType.Subscription,
            },
            {
                type: 'policySetDefinitions',
                scopes: ScopeType.Tenant | ScopeType.ManagementGroup | ScopeType.Subscription,
            },
            {
                type: 'policyAssignments',
                scopes: ScopeType.ManagementGroup | ScopeType.Subscription | ScopeType.ResourceGroup | ScopeType.Extension,
            },
            {
                type: 'policyExemptions',
                scopes: ScopeType.ManagementGroup | ScopeType.Subscription | ScopeType.ResourceGroup | ScopeType.Extension,
            },
            {
                type: 'policyPricings',
                scopes: ScopeType.ManagementGroup | ScopeType.Subscription,
            },
        ],
        postProcessor: policyProcessor
    },
    {
        basePath: 'resources/resource-manager/Microsoft.Authorization/privatelinks',
        namespace: 'Microsoft.Authorization',
        useNamespaceFromConfig: true,
        suffix: 'Resources.PrivateLinks',
        postProcessor: policyProcessor
    },
    {
        basePath: 'resources/resource-manager/Microsoft.Features/features',
        namespace: 'Microsoft.Features',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'relay/resource-manager/Microsoft.Relay/Relay',
        namespace: 'Microsoft.Relay',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'recoveryservicessiterecovery/resource-manager/Microsoft.RecoveryServices/SiteRecovery',
        namespace: 'Microsoft.RecoveryServices',
        useNamespaceFromConfig: true,
        suffix: 'SiteRecovery',
    },
    {
        basePath: 'recoveryservicesbackup/resource-manager/Microsoft.RecoveryServices/RecoveryServicesBackup',
        namespace: 'Microsoft.RecoveryServices',
        useNamespaceFromConfig: true,
        suffix: "Backup",
    },
    {
        basePath: "recoveryservices/resource-manager/Microsoft.RecoveryServices/RecoveryServices",
        namespace: "Microsoft.RecoveryServices",
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'reservations/resource-manager',
        namespace: 'Microsoft.Capacity',
    },
    {
        basePath: 'servicebus/resource-manager/Microsoft.ServiceBus/ServiceBus',
        namespace: 'Microsoft.ServiceBus',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'servicefabric/resource-manager/Microsoft.ServiceFabric/ServiceFabric',
        namespace: 'Microsoft.ServiceFabric',
        useNamespaceFromConfig: true,
        postProcessor: serviceFabricPostProcessor,
    },
    {
        basePath: 'servicelinker/resource-manager',
        namespace: 'Microsoft.ServiceLinker',
        resourceConfig: [
            {
                type: 'linkers',
                scopes: ScopeType.Extension,
            },
            {
                type: 'dryruns',
                scopes: ScopeType.Extension,
            },
        ],
    },
    {
        basePath: 'signalr/resource-manager/Microsoft.SignalRService/SignalRService',
        namespace: 'Microsoft.SignalRService',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'servicenetworking/resource-manager/Microsoft.ServiceNetworking/ServiceNetworking',
        namespace: 'Microsoft.ServiceNetworking',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'webpubsub/resource-manager/Microsoft.SignalRService/SignalRService',
        namespace: 'Microsoft.SignalRService',
        useNamespaceFromConfig: true,
        suffix: 'WebPubSub',
    },
    {
        basePath: 'sqlvirtualmachine/resource-manager/Microsoft.SqlVirtualMachine/SqlVirtualMachine',
        namespace: 'Microsoft.SqlVirtualMachine',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'storagecache/resource-manager/Microsoft.StorageCache/StorageCache',
        namespace: 'Microsoft.StorageCache',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'storagepool/resource-manager/Microsoft.StoragePool/StoragePool',
        namespace: 'Microsoft.StoragePool',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'streamanalytics/resource-manager',
        namespace: 'Microsoft.StreamAnalytics',
    },
    {
        basePath: 'storagesync/resource-manager/Microsoft.StorageSync/StorageSync',
        namespace: 'Microsoft.StorageSync',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'serialconsole/resource-manager/Microsoft.SerialConsole/SerialConsole',
        namespace: 'Microsoft.SerialConsole',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'synapse/resource-manager',
        namespace: 'Microsoft.Synapse',
    },
    {
        basePath: 'security/resource-manager',
        namespace: 'Microsoft.Security',
        resourceConfig: [
            {
                type: 'advancedThreatProtectionSettings',
                scopes: ScopeType.Subscription | ScopeType.ResourceGroup | ScopeType.Extension,
            },
            {
                type: 'assessments',
                scopes: ScopeType.Subscription | ScopeType.ResourceGroup | ScopeType.Extension,
            },
            {
                type: 'deviceSecurityGroups',
                scopes: ScopeType.Subscription | ScopeType.ResourceGroup | ScopeType.Extension,
            },
            {
                type: 'iotSensors',
                scopes: ScopeType.Subscription | ScopeType.ResourceGroup | ScopeType.Extension,
            },
            {
                type: 'informationProtectionPolicies',
                scopes: ScopeType.ManagementGroup | ScopeType.Extension,
            },
            {
                type: 'sqlVulnerabilityAssessments/baselineRules',
                scopes: ScopeType.Extension,
            },
            {
                type: 'iotSites',
                scopes: ScopeType.Subscription | ScopeType.ResourceGroup | ScopeType.Extension,
            },
            {
                type: 'assessments/governanceAssignments',
                scopes: ScopeType.Subscription,
            },
            {
                type: 'governanceRules',
                scopes: ScopeType.Subscription,
            },
            {
                type: 'defenderForStorageSettings',
                scopes: ScopeType.Subscription,
            },
        ]
    },
    {
        basePath: 'securityinsights/resource-manager/Microsoft.SecurityInsights/SecurityInsights',
        namespace: 'Microsoft.SecurityInsights',
        useNamespaceFromConfig: true,
        suffix: 'Stable',
        postProcessor: securityInsightsPostProcessor,
    },
    {
        basePath: 'securityinsights/resource-manager/Microsoft.SecurityInsights/SecurityInsights',
        namespace: 'Microsoft.SecurityInsights',
        useNamespaceFromConfig: true,
        suffix: 'Preview',
        postProcessor: securityInsightsPostProcessor,
    },
    {
        basePath: 'storageimportexport/resource-manager/Microsoft.ImportExport/StorageImportExport',
        namespace: 'Microsoft.ImportExport',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'storSimple1200Series/resource-manager',
        namespace: 'Microsoft.StorSimple',
        suffix: '1200'
    },
    {
        basePath: 'resources/resource-manager',
        namespace: 'Microsoft.Solutions',
        suffix: 'resourcesolutions'
    },
    {
        basePath: 'resources/resource-manager/Microsoft.Solutions/managedapplications',
        namespace: 'Microsoft.Solutions',
        useNamespaceFromConfig: true,
        suffix: 'ManagedApplications'
    },
    {
        basePath: 'solutions/resource-manager',
        namespace: 'Microsoft.Solutions',
        suffix: 'solutions'
    },
    {
        basePath: 'storage/resource-manager',
        namespace: 'Microsoft.Storage',
        postProcessor: storageProcessor,
    },
    {
        basePath: 'compute/resource-manager',
        namespace: 'Microsoft.Compute',
        useNamespaceFromConfig: true,
        postProcessor: computeProcessor
    },
    {
        basePath: 'compute/resource-manager/Microsoft.Compute/RecommenderRP',
        namespace: 'Microsoft.Compute',
        useNamespaceFromConfig: true,
        suffix: 'RecommenderRP',
        postProcessor: computeProcessor
    },
    {
        basePath: 'vmwarecloudsimple/resource-manager/Microsoft.VMwareCloudSimple/VmwareCloudSimple',
        namespace: 'Microsoft.VMwareCloudSimple',
        useNamespaceFromConfig: true,
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
        basePath: 'scheduler/resource-manager/Microsoft.Scheduler/Scheduler',
        namespace: 'Microsoft.Scheduler',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'search/resource-manager/Microsoft.Search/Search',
        namespace: 'Microsoft.Search',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'subscription/resource-manager/Microsoft.Subscription/Subscription',
        namespace: 'Microsoft.Subscription',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'storsimple8000series/resource-manager',
        namespace: 'Microsoft.StorSimple',
        suffix: '8000',
    },
    {
        basePath: 'support/resource-manager/Microsoft.Support/Support',
        namespace: 'Microsoft.Support',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'softwareplan/resource-manager/Microsoft.SoftwarePlan/SoftwarePlan',
        namespace: 'Microsoft.SoftwarePlan',
        useNamespaceFromConfig: true,
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
        basePath: 'imagebuilder/resource-manager/Microsoft.VirtualMachineImages/ImageBuilder',
        namespace: 'Microsoft.VirtualMachineImages',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'vmware/resource-manager/Microsoft.AVS/AVS',
        namespace: 'Microsoft.AVS',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'windowsesu/resource-manager',
        namespace: 'Microsoft.WindowsESU',
    },
    {
        basePath: 'windowsiot/resource-manager/Microsoft.WindowsIoT/WindowsIotServices',
        namespace: 'Microsoft.WindowsIoT',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'adp/resource-manager',
        namespace: 'Microsoft.AutonomousDevelopmentPlatform',
    },
    {
        basePath: 'automanage/resource-manager',
        namespace: 'Microsoft.Automanage',
    },
    {
        basePath: 'confluent/resource-manager',
        namespace: 'Microsoft.Confluent',
    },
    {
        basePath: 'datamigration/resource-manager/Microsoft.DataMigration/DataMigration',
        namespace: 'Microsoft.DataMigration',
        useNamespaceFromConfig: true,
        resourceConfig: [
            {
                type: 'databaseMigrations',
                scopes: ScopeType.Extension
            }
        ]
    },
    {
        basePath: 'datadog/resource-manager',
        namespace: 'Microsoft.Datadog',
    },
    {
        basePath: 'elastic/resource-manager',
        namespace: 'Microsoft.Elastic',
    },
    {
        basePath: 'logz/resource-manager',
        namespace: 'Microsoft.Logz',
    },
    {
        basePath: 'dynatrace/resource-manager',
        namespace: 'Dynatrace.Observability',
    },
    {
        basePath: 'healthbot/resource-manager',
        namespace: 'Microsoft.HealthBot',
    },
    {
        basePath: 'keyvault/resource-manager',
        namespace: 'Microsoft.KeyVault',
        readmeTag: {
            '2016-10-01': [
                'Microsoft.KeyVault/stable/2016-10-01/keyvault.json',
                'Microsoft.KeyVault/stable/2016-10-01/providers.json',
                'Microsoft.KeyVault/stable/2016-10-01/secrets.json',
            ],
            '2018-02-14': [
                'Microsoft.KeyVault/stable/2018-02-14/keyvault.json',
                'Microsoft.KeyVault/stable/2018-02-14/providers.json',
                'Microsoft.KeyVault/stable/2018-02-14/secrets.json',
            ],
            '2018-02-14-preview': [
                'Microsoft.KeyVault/preview/2018-02-14-preview/keyvault.json',
                'Microsoft.KeyVault/preview/2018-02-14-preview/providers.json',
                'Microsoft.KeyVault/preview/2018-02-14-preview/secrets.json',
            ],
        }
    },
    {
        basePath: 'hybridkubernetes/resource-manager',
        namespace: 'Microsoft.Kubernetes',
    },
    {
        basePath: 'hybridnetwork/resource-manager',
        namespace: 'Microsoft.HybridNetwork',
    },
    {
        basePath: 'powerplatform/resource-manager/Microsoft.PowerPlatform/PowerPlatform',
        namespace: 'Microsoft.PowerPlatform',
        useNamespaceFromConfig: true,
    },
    //Disabled until errors are fixed
    //Remove deprectated version 2024-01-01-preview from readme
    /*{
        basePath: 'monitor/resource-manager',
        namespace: 'Microsoft.Insights',
        resourceConfig: [
            {
                type: 'diagnosticSettings',
                scopes: ScopeType.Subscription | ScopeType.Extension,
            },
            {
                type: 'guestDiagnosticSettingsAssociation',
                scopes: ScopeType.Extension,
            },
            {
                type: 'dataCollectionRuleAssociations',
                scopes: ScopeType.Extension,
            },
        ],
    },*/
    {
        basePath: 'applicationinsights/resource-manager',
        namespace: 'Microsoft.Insights',
        suffix: 'Application',
        postProcessor: insightsApplicationPostProcessor,
    },
    {
        basePath: 'quantum/resource-manager',
        namespace: 'Microsoft.Quantum',
    },
    {
        basePath: 'kubernetesconfiguration/resource-manager/Microsoft.KubernetesConfiguration/extensionTypes',
        namespace: 'Microsoft.KubernetesConfiguration',
        useNamespaceFromConfig: true,
        suffix: 'ExtensionTypes',
        resourceConfig: [
            {
                type: 'sourceControlConfigurations',
                scopes: ScopeType.Extension
            }
        ]
    },
    {
        basePath: 'kubernetesconfiguration/resource-manager/Microsoft.KubernetesConfiguration/extensions',
        namespace: 'Microsoft.KubernetesConfiguration',
        useNamespaceFromConfig: true,
        suffix: 'Extensions',
    },
    {
        basePath: 'kubernetesconfiguration/resource-manager/Microsoft.KubernetesConfiguration/fluxConfigurations',
        namespace: 'Microsoft.KubernetesConfiguration',
        useNamespaceFromConfig: true,
        suffix: 'FluxConfigurations',
    },
    {
        basePath: 'kubernetesconfiguration/resource-manager/Microsoft.KubernetesConfiguration/privateLinkScopes',
        namespace: 'Microsoft.KubernetesConfiguration',
        useNamespaceFromConfig: true,
        suffix: 'PrivateLinkScopes',
    },
    {
        basePath: 'certificateregistration/resource-manager/Microsoft.CertificateRegistration/CertificateRegistration',
        namespace: 'Microsoft.CertificateRegistration',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'domainregistration/resource-manager/Microsoft.DomainRegistration/DomainRegistration',
        namespace: 'Microsoft.DomainRegistration',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'deviceupdate/resource-manager',
        namespace: 'Microsoft.DeviceUpdate',
    },
    {
        basePath: 'mediaservices/resource-manager',
        namespace: 'Microsoft.Media',
        postProcessor: mediaPostProcessor
    },
    {
        basePath: 'trafficmanager/resource-manager/Microsoft.Network/TrafficManager',
        namespace: 'Microsoft.Network',
        useNamespaceFromConfig: true,
        suffix: 'TrafficManager',
    },
    /*{
        //Disabled until a workaround is found
        basePath: 'network/resource-manager',
        namespace: 'Microsoft.Network',
        postProcessor: networkPostProcessor,
        suffix: 'NRP',
    },*/
    {
        basePath: 'dnsresolver/resource-manager/Microsoft.Network/DnsResolver',
        namespace: 'Microsoft.Network',
        useNamespaceFromConfig: true,
        suffix: 'DnsResolver',
    },
    {
        basePath: 'frontdoor/resource-manager',
        namespace: 'Microsoft.Network',
        suffix: 'FrontDoor',
    },
    {
        basePath: 'dns/resource-manager/Microsoft.Network/Dns',
        namespace: 'Microsoft.Network',
        useNamespaceFromConfig: true,
        suffix: 'DNS',
    },
    {
        basePath: 'privatedns/resource-manager/Microsoft.Network/PrivateDns',
        namespace: 'Microsoft.Network',
        useNamespaceFromConfig: true,
        suffix: 'privateDns',
    },
    {
        //Pause autogeneration until errors are fixed
        basePath: 'azurestackhci/resource-manager',
        namespace: 'Microsoft.AzureStackHCI',
        postProcessor: azureStackHciPostProcessor,
    },
    {
        basePath: 'azurestackhci/resource-manager/Microsoft.AzureStackHCI/StackHCIVM',
        namespace: 'Microsoft.AzureStackHCI',
        useNamespaceFromConfig: true,
        suffix: 'StackHCIVM',
        postProcessor: azureStackHciPostProcessor,
    },
    {
        basePath: 'advisor/resource-manager/Microsoft.Advisor/Advisor',
        namespace: 'Microsoft.Advisor',
        useNamespaceFromConfig: true,
        resourceConfig: [
            {
                type: 'recommendations/suppressions',
                scopes: ScopeType.Tenant | ScopeType.ManagementGroup | ScopeType.Subscription | ScopeType.ResourceGroup | ScopeType.Extension,
            },
        ]
    },
    {
        basePath: 'containerservice/resource-manager/Microsoft.ContainerService/aks',
        namespace: 'Microsoft.ContainerService',
        useNamespaceFromConfig: true,
        suffix: 'Aks'
    },
    {
        basePath: 'containerservice/resource-manager/Microsoft.ContainerService/fleet',
        namespace: 'Microsoft.ContainerService',
        useNamespaceFromConfig: true,
        suffix: 'Fleet'
    },
    {
        basePath: 'containerservice/resource-manager/Microsoft.ContainerService/deploymentsafeguards',
        namespace: 'Microsoft.ContainerService',
        useNamespaceFromConfig: true,
        suffix: 'DeploymentSafeguards'
    },
    {
        basePath: 'containerservice/resource-manager/Microsoft.ContainerService/nodecustomization',
        namespace: 'Microsoft.ContainerService',
        useNamespaceFromConfig: true,
        suffix: 'NodeCustomization'
    },
    {
        basePath: 'hdinsight/resource-manager/Microsoft.HDInsight/HDInsightOnAks',
        namespace: 'Microsoft.HDInsight',
        useNamespaceFromConfig: true,
        suffix: 'OnAks',
    },
    {
        basePath: 'developerhub/resource-manager/Microsoft.DevHub/DeveloperHub',
        namespace: 'Microsoft.DevHub',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'domainservices/resource-manager/Microsoft.AAD/DomainServices',
        namespace: 'Microsoft.AAD',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'edgeorderpartner/resource-manager',
        namespace: 'Microsoft.EdgeOrderPartner',
    },
    {
        basePath: 'servicefabricmesh/resource-manager/Microsoft.ServiceFabricMesh/ServiceFabricMesh',
        namespace: 'Microsoft.ServiceFabricMesh',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'operationalinsights/resource-manager/Microsoft.OperationalInsights/OperationalInsights',
        namespace: 'Microsoft.OperationalInsights',
        useNamespaceFromConfig: true,
    },
    {
        basePath: 'service-map/resource-manager/Microsoft.OperationalInsights/ServiceMap',
        namespace: 'Microsoft.OperationalInsights',
        useNamespaceFromConfig: true,
        suffix: 'ServiceMap',
    },
    {
        basePath: 'managedservices/resource-manager/Microsoft.ManagedServices/ManagedServices',
        namespace: 'Microsoft.ManagedServices',
        useNamespaceFromConfig: true,
        resourceConfig: [
            {
                type: 'registrationDefinitions',
                scopes: ScopeType.Subscription,
            },
            {
                type: 'registrationAssignments',
                scopes: ScopeType.Subscription | ScopeType.ResourceGroup,
            },
        ]
    },
];

export function getFullAutoGenList(): AutoGenConfig[] {
    return autoGenList;
}

export function findAutogenEntries(basePath: string): AutoGenConfig[] {
    return autoGenList.filter(w => lowerCaseEquals(w.basePath, basePath));
}

export async function findOrGenerateAutogenEntries(basePath: string, readme: string): Promise<AutoGenConfig[]> {
    let entries = findAutogenEntries(basePath);
    if (entries.some(e => e.useNamespaceFromConfig)) {
        return entries;
    }

    const detectedNamespaces = await detectProviderNamespaces(readme);
    entries = entries.filter(e => detectedNamespaces.some(ns => lowerCaseEquals(e.namespace, ns)));

    // If no entries found or all filtered out, attempt auto-generation
    if (entries.length === 0) {
        // Helper function to extract provider namespace from basePath
        const extractProviderNamespace = (path: string): string | null => {
            const parts = path.split('/');
            const providerPart = parts.find(p => p.startsWith('Microsoft.') || p.startsWith('microsoft.'));
            return providerPart || null;
        };

        // Helper function to extract child namespace (subfolder) from basePath
        const extractChildNamespace = (path: string, providerNamespace: string): string | null => {
            const parts = path.split('/');
            const providerIndex = parts.findIndex(p => lowerCaseEquals(p, providerNamespace));
            if (providerIndex >= 0 && providerIndex < parts.length - 1) {
                // Return the subfolder after the provider namespace
                return parts[providerIndex + 1];
            }
            return null;
        };

        const actualNamespace = extractProviderNamespace(basePath);
        
        if (actualNamespace) {
            const childNamespace = extractChildNamespace(basePath, actualNamespace);
            
            if (childNamespace) {
                // Check if child namespace matches parent's last segment (e.g., Microsoft.Cdn -> Cdn)
                const parentLastSegment = actualNamespace.split('.').pop()?.toLowerCase();
                const childLower = childNamespace.toLowerCase();
                
                if (parentLastSegment && lowerCaseEquals(parentLastSegment, childLower)) {
                    // Matching child becomes the primary (no suffix) - overwrites old file
                    entries.push({
                        basePath,
                        namespace: actualNamespace,
                        // No suffix - this will write to Microsoft.Cdn.json (overwrites old)
                    });
                } else {
                    // Non-matching child gets suffixed
                    entries.push({
                        basePath,
                        namespace: actualNamespace,
                        suffix: childNamespace, // e.g., FrontDoor, EdgeOrder
                    });
                }
            } else {
                // No child namespace detected, use parent without suffix
                entries.push({
                    basePath,
                    namespace: actualNamespace,
                });
            }
        } else {
            // Fallback to old structure, with logging
            console.warn(`⚠️  Unable to auto-generate config for old basePath structure: ${basePath}. Consider adding explicit entry to autogenlist.ts`);
            for (const namespace of detectedNamespaces) {
                if (!entries.some(e => lowerCaseEquals(e.namespace, namespace))) {
                    entries.push({
                        basePath,
                        namespace,
                    });
                }
            }
        }
    }

    return entries;
}
