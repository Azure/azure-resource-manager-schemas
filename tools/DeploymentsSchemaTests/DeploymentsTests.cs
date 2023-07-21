using Azure.Deployments.Core.Definitions.Identifiers;
using Azure.Deployments.Core.Definitions.Resources;
using Azure.Deployments.Core.EventSources;
using Azure.Deployments.Templates.Contracts;
using Azure.Deployments.Templates.Engines;
using Azure.Deployments.Templates.Export;
using FluentAssertions;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Microsoft.WindowsAzure.ResourceStack.Common.Collections;
using Microsoft.WindowsAzure.ResourceStack.Common.Json;
using Moq;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;

namespace DeploymentsSchemaTests
{
    [TestClass]
    public class DeploymentsTests
    {
        private readonly Lazy<INormalizedSchemaCache> schemaCacheLazy = new(() => 
            TestSchemaCache.CreateFromFilePaths(
                filePaths: Directory.EnumerateFiles(
                    path: "schemas",
                    searchPattern: "*.json",
                    searchOption: SearchOption.AllDirectories)));

        [TestMethod]
        public void TestSchemaLoader()
        {
            var createAssemblyFunc = () => schemaCacheLazy.Value;
            createAssemblyFunc.Should().NotThrow();
        }

        private record InputData(
            string ResourceId,
            string ApiVersion,
            JObject ResourceBody);

        [DataTestMethod]
        [DataRow("apimanagement")]
        [DataRow("automationaccount")]
        [DataRow("keyvault")]
        [DataRow("nic")]
        [DataRow("nsg")]
        [DataRow("servicebus")]
        [DataRow("sites")]
        [DataRow("sql")]
        [DataRow("storage")]
        [DataRow("vm")]
        [DataRow("vnet")]
        public async Task Export_should_give_expected_result(string baseline)
        {
            // This test makes it straightforward to add data-driven baselines to give confidence that Export for a given RP won't be modified
            var input = typeof(DeploymentsTests).Assembly.GetManifestResourceStream($"Files/baselines/{baseline}/input.json").FromJsonStream<InputData>();
            var output = typeof(DeploymentsTests).Assembly.GetManifestResourceStream($"Files/baselines/{baseline}/output.json").FromJsonStream<JToken>();

            var apiVersion = input.ApiVersion;
            var resourceId = ResourceGroupLevelResourceId.Parse(input.ResourceId);
            
            var resourceBody = input.ResourceBody.FromJToken<ResourceProxyDefinition>();
            resourceBody.ApiVersion = apiVersion;
            resourceBody.Id = resourceId.FullyQualifiedId;
            resourceBody.Type = resourceId.FormatFullyQualifiedType();
            resourceBody.Name = resourceId.FormatName();

            var eventSourceMock = new Mock<IDeploymentEventSource>();
            var schemaProviderMock = new Mock<INormalizedSchemaProvider>();
            schemaProviderMock.Setup(x => x.GetSchemasForNamespace(It.IsAny<string>(), It.IsAny<string>(), null, null, default))
                .Returns<string, string, string, string, CancellationToken>((_, providerNamespace, _, _, _) =>
                {
                    var result = new OrdinalInsensitiveDictionary<ResourceTypeSchema>();

                    foreach (var grouping in schemaCacheLazy.Value.GetSchemasForProvider(providerNamespace))
                    {
                        var resourceType = grouping.Key;
                        var schema = grouping.FirstOrDefault(x => x.MostRecentApiVersion == apiVersion);

                        if (schema != null)
                        {
                            result[resourceType] = schema;
                        }
                    }

                    return Task.FromResult<IReadOnlyDictionary<string, ResourceTypeSchema>>(result);
                });
            var engine = new ExportTemplateEngine(eventSourceMock.Object, schemaProviderMock.Object, new [] { 
                ".blob.core.windows.net",
                ".table.core.windows.net",
                ".queue.core.windows.net",
            });

            var result = await engine.ExportAsTemplate(new() {
                SubscriptionId = resourceId.SubscriptionId,
                ResourceGroupName = resourceBody.ResourceGroup,
                ExportOptions = new() { },
            }, new [] { resourceBody });

            var template = result.Value.ToJToken();

            JToken.DeepEquals(output, template).Should().BeTrue($"generated template {template} should match output baseline {output}");
        }
    }
}
