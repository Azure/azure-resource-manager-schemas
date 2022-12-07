// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { ScopeType, AutoGenConfig } from './models';
import { postProcessor as insightsApplicationPostProcessor } from './processors/Microsoft.Insights.Application';
import { postProcessor as resourcesPostProcessor } from './processors/Microsoft.Resources';
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
import { lowerCaseEquals } from './utils';

// New providers are onboarded by default. The providers listed here are the only ones **not** onboarded.
const disabledProviders: AutoGenConfig[] = [
    {
        basePath: 'advisor/resource-manager',
        namespace: 'Microsoft.Advisor',
        disabledForAutogen: true,
    },
    {
        basePath: 'cloudshell/resource-manager',
        namespace: 'Microsoft.Portal',
        disabledForAutogen: true,
    },
    {
        basePath: 'compute/resource-manager',
        namespace: 'Microsoft.ContainerService',
        disabledForAutogen: true,
    },
    {
        // Disabled as the swagger spec contains a type ("DateTimeRfc1123") which autorest is unable to parse: https://github.com/Azure/autorest.azureresourceschema/issues/71
        basePath: 'domainservices/resource-manager',
        namespace: 'Microsoft.AAD',
        disabledForAutogen: true,
    },
    {
        basePath: 'dns/resource-manager',
        namespace: 'Microsoft.Network',
        disabledForAutogen: true,
        suffix: 'DNS',
    },
    {
        // Disabled as the swagger spec contains a bug (enum mismatch)
        basePath: 'edgeorderpartner/resource-manager',
        namespace: 'Microsoft.EdgeOrderPartner',
        disabledForAutogen: true,
    },
    {
        basePath: 'logic/resource-manager',
        namespace: 'Microsoft.Logic',
        disabledForAutogen: true,
    },
    {
        basePath: 'managedservices/resource-manager',
        namespace: 'Microsoft.ManagedServices',
        disabledForAutogen: true,
    },
    {
        basePath: 'operationsmanagement/resource-manager',
        namespace: 'Microsoft.OperationsManagement',
        disabledForAutogen: true,
    },
    {
        basePath: 'privatedns/resource-manager',
        namespace: 'Microsoft.Network',
        disabledForAutogen: true,
        suffix: 'privateDns',
    },
    {
        basePath: 'service-map/resource-manager',
        namespace: 'Microsoft.OperationalInsights',
        disabledForAutogen: true,
    },
    {
        basePath: 'trafficmanager/resource-manager',
        namespace: 'Microsoft.Network',
        disabledForAutogen: true,
        suffix: 'trafficManager',
    },
    {
        basePath: 'videoanalyzer/resource-manager',
        namespace: 'Microsoft.Media',
        disabledForAutogen: true,
    },
    {
        // Disabled as the swagger spec contains a bug (enum mismatch)
        basePath: 'servicefabricmesh/resource-manager',
        namespace: 'Microsoft.ServiceFabricMesh',
        disabledForAutogen: true,
    },
    { 
        // Disabled as the swagger spec contains a bug (enum mismatch - missing: ProvisioningStateEnum)
        basePath: 'operationalinsights/resource-manager',
        namespace: 'Microsoft.OperationalInsights',
        disabledForAutogen: true,
    }
];

// Run "npm run list-basepaths" to discover all the valid readme files to add to this list
const autoGenList: AutoGenConfig[] = [
    ...disabledProviders,
    {
        basePath: 'addons/resource-manager',
        namespace: 'Microsoft.Addons',
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
        basePath: 'azurearcdata/resource-manager',
        namespace: 'Microsoft.AzureArcData',
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
        basePath: 'blockchain/resource-manager',
        namespace: 'Microsoft.Blockchain',
    },
    {
        basePath: 'blueprint/resource-manager',
        namespace: 'Microsoft.Blueprint',
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
        basePath: 'communication/resource-manager',
        namespace: 'Microsoft.Communication',
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
        basePath: 'consumption/resource-manager',
        namespace: 'Microsoft.Consumption',
        resourceConfig: [
            {
                type: 'budgets',
                scopes: ScopeType.Subscription | ScopeType.ResourceGroup | ScopeType.Extension,
            },
        ],
    },
    {
        basePath: 'cost-management/resource-manager',
        namespace: 'Microsoft.CostManagement',
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
        basePath: 'redisenterprise/resource-manager',
        namespace: 'Microsoft.Cache',
        suffix: 'Enterprise'
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
        basePath: 'resourcehealth/resource-manager',
        namespace: 'Microsoft.ResourceHealth',
    },
    {
        basePath: 'EnterpriseKnowledgeGraph/resource-manager',
        namespace: 'Microsoft.EnterpriseKnowledgeGraph',
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
        basePath: 'healthcareapis/resource-manager',
        namespace: 'Microsoft.HealthcareApis',
    }, 
    {
        basePath: 'hybridcompute/resource-manager',
        namespace: 'Microsoft.HybridCompute',
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
        basePath: 'azure-kusto/resource-manager',
        namespace: 'Microsoft.Kusto',
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
        basePath: 'maintenance/resource-manager',
        namespace: 'Microsoft.Maintenance',
    },
    {
        basePath: 'migrate/resource-manager',
        namespace: 'Microsoft.Migrate',
        suffix: 'Migrate'
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
                scopes: ScopeType.Subscription,
            },
        ],
    },
    {
        basePath: 'migrateprojects/resource-manager',
        namespace: 'Microsoft.Migrate',
        suffix: 'MigrateProjects',
    },
    {
        basePath: 'resourcemover/resource-manager',
        namespace: 'Microsoft.Migrate',
        suffix: 'ResourceMover',
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
        basePath: 'mixedreality/resource-manager',
        namespace: 'Microsoft.MixedReality',
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
                scopes: ScopeType.Subscription | ScopeType.ResourceGroup | ScopeType.ManagementGroup,
            },
            {
                type: 'attestations',
                scopes: ScopeType.Subscription | ScopeType.ResourceGroup,
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
        basePath: 'providerhub/resource-manager',
        namespace: 'Microsoft.ProviderHub',
        postProcessor: providerHubPostProcessor
    },
    {
        basePath: 'quota/resource-manager',
        namespace: 'Microsoft.Quota',
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
        basePath: 'redhatopenshift/resource-manager',
        namespace: 'Microsoft.RedHatOpenShift',
    },
    {
        basePath: 'resources/resource-manager',
        namespace: 'Microsoft.Resources',
        resourceConfig: [
            {
                type: 'deployments',
                scopes: ScopeType.Tenant | ScopeType.ManagementGroup | ScopeType.Subscription | ScopeType.ResourceGroup,
            },
            {
                type: 'tags',
                scopes: ScopeType.ManagementGroup | ScopeType.Subscription | ScopeType.ResourceGroup | ScopeType.Extension,
            },
        ],
        postProcessor: resourcesPostProcessor,
    },
    {
        basePath: 'resources/resource-manager',
        namespace: 'Microsoft.Authorization',
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
            {
                type: 'locks',
                scopes: ScopeType.Subscription | ScopeType.ResourceGroup | ScopeType.Extension,
            },
        ],
        suffix: 'Resources',
        postProcessor: policyProcessor
    },
    {
        basePath: 'relay/resource-manager',
        namespace: 'Microsoft.Relay',
    },
    {
        basePath: 'recoveryservicessiterecovery/resource-manager',
        namespace: 'Microsoft.RecoveryServices',
        suffix: 'SiteRecovery',
    },
    {
        basePath: 'recoveryservicesbackup/resource-manager',
        namespace: 'Microsoft.RecoveryServices',
        suffix: "Backup"
    },
    {
        basePath: "recoveryservices/resource-manager",
        namespace: "Microsoft.RecoveryServices"
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
        basePath: 'signalr/resource-manager',
        namespace: 'Microsoft.SignalRService',
    },
    {
        basePath: 'webpubsub/resource-manager',
        namespace: 'Microsoft.SignalRService',
        suffix: 'WebPubSub',
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
        basePath: 'storagepool/resource-manager',
        namespace: 'Microsoft.StoragePool',
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
        ]
    },
    {
        basePath: 'securityinsights/resource-manager',
        namespace: 'Microsoft.SecurityInsights',
        postProcessor: securityInsightsPostProcessor,
    },
    {
        basePath: 'storageimportexport/resource-manager',
        namespace: 'Microsoft.ImportExport'
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
        basePath: 'solutions/resource-manager',
        namespace: 'Microsoft.Solutions',
        suffix: 'solutions'
    },
    {
        basePath: 'storage/resource-manager',
        namespace: 'Microsoft.Storage',
        postProcessor: storageProcessor
    },
    {
        basePath: 'compute/resource-manager',
        namespace: 'Microsoft.Compute',
        postProcessor: computeProcessor
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
        basePath: 'datamigration/resource-manager',
        namespace: 'Microsoft.DataMigration',
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
        basePath: 'powerplatform/resource-manager',
        namespace: 'Microsoft.PowerPlatform',
    },
    {
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
    },
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
        basePath: 'kubernetesconfiguration/resource-manager',
        namespace: 'Microsoft.KubernetesConfiguration',
        resourceConfig: [
            {
                type: 'sourceControlConfigurations',
                scopes: ScopeType.Extension
            }
        ]
    },
    {
        basePath: 'web/resource-manager',
        namespace: 'Microsoft.CertificateRegistration'
    },
    {
        basePath: 'web/resource-manager',
        namespace: 'Microsoft.DomainRegistration'
    },
    {
        basePath: 'web/resource-manager',
        namespace: 'Microsoft.Web'
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
        basePath: 'network/resource-manager',
        namespace: 'Microsoft.Network',
		postProcessor: networkPostProcessor,
        suffix: 'NRP'
    },
	{
        basePath: 'dnsresolver/resource-manager',
        namespace: 'Microsoft.Network',
        suffix: 'DnsResolver',
    },
];

export function findAutogenEntries(basePath: string): AutoGenConfig[] {
    return autoGenList.filter(w => lowerCaseEquals(w.basePath, basePath));
}

export function findOrGenerateAutogenEntries(basePath: string, namespaces: string[]): AutoGenConfig[] {
    const entries = findAutogenEntries(basePath).filter(e => namespaces.some(ns => lowerCaseEquals(e.namespace, ns)));

    for (const namespace of namespaces) {
        if (!entries.some(e => lowerCaseEquals(e.namespace, namespace))) {
            // Generate configuration for any RPs not explicitly declared in the autogen list
            entries.push({
                basePath,
                namespace,
            });
        }
    }

    return entries;
}
