// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Azure.Bicep.Types.Az;
using Azure.Deployments.Core.Components;
using Azure.Deployments.Core.Definitions;
using Azure.Deployments.Core.Definitions.Identifiers;
using Azure.Deployments.Core.Definitions.Resources;
using Azure.Deployments.Core.Definitions.Schema;
using Azure.Deployments.Core.Entities;
using Azure.Deployments.Core.EventSources;
using Azure.Deployments.Core.Json;
using Azure.Deployments.Engine.Interfaces;
using Azure.Deployments.Engine.Providers;
using Azure.Deployments.Templates.Contracts;
using Azure.Deployments.Templates.Export;
using Azure.Deployments.Testing.Utilities;
using Microsoft.WindowsAzure.ResourceStack.Common.Extensions;
using Microsoft.WindowsAzure.ResourceStack.Common.Json;
using Moq;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace TemplateSchemaGenerator.Tests;

[TestClass]
public class ExportTemplateEngineScenarioTests
{
    public TestContext TestContext { get; set; }

    public class TestSchemaLoader : ISchemaLoader
    {
        public HashSet<string> CircularReferenceSchemas { get; } = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            // This list should be kept in-sync with the product code
            "Microsoft.Media/2018-07-01",
            "Microsoft.DataFactory/2017-09-01-preview",
            "Microsoft.DataFactory/2018-06-01",
        };

        public HashSet<string> ResourceTypeSchemasExcluded { get; } = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            // This list should be kept in-sync with the product code
            "Microsoft.MachineLearningServices/workspaces/onlineEndpoints",
            "Microsoft.MachineLearningServices/workspaces/onlineEndpoints/deployments",
            "Microsoft.MachineLearningServices/workspaces/batchEndpoints",
            "Microsoft.MachineLearningServices/workspaces/batchEndpoints/deployments",
            "Microsoft.MachineLearningServices/workspaces/batchEndpoints/jobs",
            "Microsoft.MachineLearningServices/workspaces/batchEndpoints/deployments/jobs",
            "Microsoft.MachineLearningServices/workspaces/jobs",
            "Microsoft.MachineLearningServices/workspaces/codes",
            "Microsoft.MachineLearningServices/workspaces/codes/versions",
            "Microsoft.MachineLearningServices/workspaces/components",
            "Microsoft.MachineLearningServices/workspaces/components/versions",
            "Microsoft.MachineLearningServices/workspaces/environments",
            "Microsoft.MachineLearningServices/workspaces/data",
            "Microsoft.MachineLearningServices/workspaces/datasets",
            "Microsoft.MachineLearningServices/workspaces/services",
            "Microsoft.MachineLearningServices/workspaces/eventGridFilters",
            "Microsoft.MachineLearningServices/workspaces/models",
            "Microsoft.MachineLearningServices/workspaces/models/versions",
            "Microsoft.MachineLearningServices/workspaces/linkedServices",
            "Microsoft.MachineLearningServices/workspaces/labelingJobs",

            "Microsoft.Network/firewallPolicies/ruleGroups",
            "Microsoft.ServiceBus/namespaces/ipfilterrules",
            "Microsoft.ServiceBus/namespaces/virtualnetworkrules",
            "Microsoft.EventHub/namespaces/ipfilterrules",
            "Microsoft.EventHub/namespaces/virtualnetworkrules"
        };

        public JObject FetchSchema(string fileName) 
        {
            using var fileStream = typeof(ExportTemplateEngineScenarioTests).Assembly.GetManifestResourceStream(fileName)
                ?? throw new InvalidOperationException($"Failed to find embedded resource {fileName}");
            using var streamReader = new StreamReader(fileStream);
            using var jsonReader = new JsonTextReader(streamReader);
            return JsonSerializer.CreateDefault().Deserialize<JObject>(jsonReader)
                ?? throw new InvalidOperationException($"Failed to deserialize schema from {fileName}");
        }

        public IEnumerable<string> ListFiles()
            => typeof(ExportTemplateEngineScenarioTests).Assembly.GetManifestResourceNames().Where(x => x.StartsWith("schemas/"));
    }

    public class TestResourceTypeRegistrationProvider : IResourceTypeRegistrationProvider
    {
        private readonly INormalizedSchemaCache schemaCache;

        public TestResourceTypeRegistrationProvider(INormalizedSchemaCache schemaCache)
        {
            this.schemaCache = schemaCache;
        }

        public Task<ResourceTypeRegistrationInfo> FindMostRecentLocationInsensitiveRegistration(string subscriptionId, string resourceProviderNamespace, string resourceType, string? oboToken = null, string? oboCorrelationId = null, string? auxToken = null)
        {
            throw new NotImplementedException();
        }

        public Task<ResourceTypeRegistrationInfo> FindMostSpecificRegistration(string subscriptionId, string resourceProviderNamespace, string resourceType, string location, string apiVersion, string? oboToken = null, string? oboCorrelationId = null, string? auxToken = null)
        {
            throw new NotImplementedException();
        }

        public Task<ResourceTypeRegistrationInfo[]> FindRegistrationsForSubscription(string subscriptionId, string resourceProviderNamespace, string? oboToken = null, string? oboCorrelationId = null, string? auxToken = null, CancellationToken cancellationToken = default)
        {
            var result = schemaCache.GetSchemasForProvider(resourceProviderNamespace)
                .SelectManyArray(x => x)
                .SelectArray(x => new ResourceTypeRegistrationInfo
                {
                    ResourceProviderNamespace = x.ResourceProviderNamespace,
                    ResourceType = x.ResourceType,
                    ApiVersion = x.MostRecentApiVersion,
                });

            return Task.FromResult(result);
        }

        public Task<string> GetApiVersionForRoutingResourceType(string subscriptionId, string resourceId, string apiProfileId, string? oboToken = null, string? oboCorrelationId = null, string? auxToken = null)
        {
            throw new NotImplementedException();
        }

        public Task<string[]> GetResourceProvidersToRegister(string subscriptionId, DeploymentResource[] deploymentResources, string? oboToken = null, string? oboCorrelationId = null, string? auxToken = null)
        {
            throw new NotImplementedException();
        }

        public Task<string> GetSubscriptionRegistrationState(string subscriptionId, string resourceProviderNamespace, string? oboToken = null, string? oboCorrelationId = null, string? auxToken = null)
        {
            throw new NotImplementedException();
        }

        public Task<bool> IsRegistrationRequired(string subscriptionId, string resourceProviderNamespace, string? oboToken = null, string? oboCorrelationId = null, string? auxToken = null)
        {
            throw new NotImplementedException();
        }

        public Task ValidateDeploymentLocationAcceptable(IDeploymentRequestContext deploymentContext, string deploymentLocation, string? oboToken = null, string? oboCorrelationId = null, string? auxToken = null)
        {
            throw new NotImplementedException();
        }
    }

    private static readonly Lazy<INormalizedSchemaProvider> SchemaProviderLazy = new(() =>
    {
        // This takes 1minute+ to build, and is deterministic. Cache it to avoid unneccessarily long test time.
        var schemaCache = OfflineSchemaCache.CreateFromAssembly(new TestSchemaLoader());
        return new NormalizedSchemaProvider(schemaCache, new TestResourceTypeRegistrationProvider(schemaCache), GetDeploymentSettings());
    });

    private static readonly BicepTypeLoader BicepTypeLoader = new(new AzTypeLoader());

    [TestMethod]
    [TestCategory(BaselineHelper.BaselineTestCategory)]
    [EmbeddedFilesTestData(@"^Files/export/.*/resources.json$")]
    public async Task ExportAsTemplate_should_produce_expected_results(EmbeddedFile resourcesFile)
    {
        var baselineFolder = BaselineFolder.BuildOutputFolder(TestContext, resourcesFile);

        var resultsFileName = "result.json";
        var resultFile = baselineFolder.GetBaselineFile(resultsFileName);

        var resources = resourcesFile.Contents.FromJson<ResourceProxyDefinition[]>();
        var result = await PerformExport(resources);

        resultFile.WriteToOutputFolder(JToken.FromObject(result, SerializerSettings.SerializerWithObjectTypeSettings).ToString());
        resultFile.ShouldHaveExpectedJsonValue();
    }

    private async Task<ResultWithErrors<Template>> PerformExport(ResourceProxyDefinition[] resources)
    {
        var engine = new ExportTemplateHelper(
            new Mock<IDeploymentEventSource>().Object,
            SchemaProviderLazy.Value,
            BicepTypeLoader,
            [
                ".blob.core.windows.net",
                ".table.core.windows.net",
                ".queue.core.windows.net",
            ]);

        var firstResourceId = ResourceGroupLevelResourceId.Parse(resources.First().Id);
        var context = new ExportTemplateContext
        {
            SubscriptionId = firstResourceId.SubscriptionId,
            ResourceGroupName = firstResourceId.ResourceGroup,
            ExportOptions = ExportTemplateOptions.None,
        };

        return await engine.ExportAsTemplate(
            context,
            resources,
            ExportNormalizationMode.SchemasOnly);
    }

    private static IAzureDeploymentSettings GetDeploymentSettings()
    {
        var settings = new Mock<IAzureDeploymentSettings>();
        settings.Setup(m => m.ExportTemplateSchemaNotRequiredProviders).Returns([]);

        return settings.Object;
    }

    private class Scenario
    {
        public required string Name { get; set; }
        public required string SubscriptionId { get; set; }
        public required string ResourceGroup { get; set; }
        public required string ProviderNamespace { get; set; }
        public required string ApiVersion { get; set; }
    }
}
