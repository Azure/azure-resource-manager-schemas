// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using System.IO.Abstractions;
using System.Text.Json.Nodes;
using Azure.Bicep.Types;
using Azure.Bicep.Types.Az;
using Azure.Bicep.Types.Concrete;
using Azure.Bicep.Types.Index;
using Azure.Deployments.Templates.Export;
using Azure.Deployments.Templates.Helpers;
using FluentAssertions;
using Moq;

namespace TemplateSchemaGenerator.Tests;

[TestClass]
public class ComputeExtensionSchemaTests
{
    private const string ApiVersion = "2024-07-01";
    private const string ExtensionSchemaId = $"https://schema.management.azure.com/schemas/{ApiVersion}/Microsoft.Compute.Extensions.json#";

    private static readonly string[] ResourceTypes =
    [
        "Microsoft.Compute/virtualMachines",
        "Microsoft.Compute/virtualMachines/extensions",
        "Microsoft.Compute/virtualMachineScaleSets",
        "Microsoft.Compute/virtualMachineScaleSets/extensions",
    ];

    [TestMethod]
    public void Compute_overrides_top_level_nested_and_inline_extension_properties()
    {
        var provider = CreateResourceTypeProvider();
        var schema = JsonSchemaGenerator.GenerateProviderSchema(
            "Microsoft.Compute", ApiVersion, ResourceTypes.Select(type => provider.Get(type, ApiVersion)), sortProperties: false);

        foreach (var (section, key) in new[]
        {
            ("resourceDefinitions", "virtualMachines_extensions"),
            ("resourceDefinitions", "virtualMachineScaleSets_extensions"),
            ("definitions", "virtualMachines_extensions_childResource"),
            ("definitions", "virtualMachineScaleSets_extensions_childResource"),
            ("definitions", "VirtualMachineScaleSetExtension"),
        })
        {
            var references = schema[section]![key]!["properties"]!["properties"]!["anyOf"]!.AsArray();
            references.Should().HaveCount(35);
            references[0]!["$ref"]!.GetValue<string>().Should().Be($"{ExtensionSchemaId}/definitions/genericExtension");
            references.Select(reference => reference!["$ref"]!.GetValue<string>())
                .Should().OnlyHaveUniqueItems();
        }

        schema["resourceDefinitions"]!["virtualMachines_extensions"]!["properties"]!["name"]
            .Should().NotBeNull();
    }

    [TestMethod]
    public void Other_providers_do_not_receive_Compute_extension_overrides()
    {
        var schema = new JsonObject
        {
            ["resourceDefinitions"] = new JsonObject
            {
                ["virtualMachines_extensions"] = new JsonObject
                {
                    ["properties"] = new JsonObject { ["properties"] = new JsonObject { ["type"] = "object" } },
                },
            },
        };
        var original = schema.DeepClone();

        SpecialCaseRewriter.Rewrite("Microsoft.Network", schema, ApiVersion);

        JsonNode.DeepEquals(schema, original).Should().BeTrue();
    }

    [TestMethod]
    public void Moving_extension_resources_preserves_references_and_independent_definitions()
    {
        var schema = new JsonObject
        {
            ["id"] = $"https://schema.management.azure.com/schemas/{ApiVersion}/Microsoft.Compute.json#",
            ["resourceDefinitions"] = new JsonObject
            {
                ["virtualMachines_extensions"] = new JsonObject
                {
                    ["properties"] = new JsonObject
                    {
                        ["tags"] = new JsonObject { ["$ref"] = "#/definitions/Tags" },
                    },
                },
                ["virtualMachines"] = new JsonObject(),
            },
        };

        var extensions = ComputeExtensionSchema.Extract(schema, ApiVersion);

        schema["resourceDefinitions"]!.AsObject().ContainsKey("virtualMachines_extensions").Should().BeFalse();
        schema["resourceDefinitions"]!.AsObject().ContainsKey("virtualMachines").Should().BeTrue();
        extensions["resourceDefinitions"]!["virtualMachines_extensions"]!["properties"]!["tags"]!["$ref"]!
            .GetValue<string>().Should().Be($"https://schema.management.azure.com/schemas/{ApiVersion}/Microsoft.Compute.json#/definitions/Tags");
        extensions["definitions"]!.AsObject().Should().HaveCount(35);
        extensions["definitions"]!["genericExtension"]!["required"]!.AsArray()
            .Select(value => value!.GetValue<string>())
            .Should().Equal("publisher", "type", "typeHandlerVersion", "settings");
        extensions["definitions"]!["genericExtension"]!["type"] = "string";
        var nextExtensions = ComputeExtensionSchema.Extract(new JsonObject(), ApiVersion);
        nextExtensions["definitions"]!["genericExtension"]!["type"]!.GetValue<string>().Should().Be("object");
    }

    [TestMethod]
    public void Backend_schema_loader_resolves_Compute_extension_overrides()
    {
        var paths = SchemaUtils.ExternalReferenceWhitelist.Concat(SchemaUtils.TopLevelReferenceSchemas)
            .Select(key => Path.Combine("schemas", key.Replace('/', Path.DirectorySeparatorChar)))
            .Where(File.Exists)
            .Concat(new[]
            {
                Path.Combine("schemas", ApiVersion, "Microsoft.Compute.json"),
                Path.Combine("schemas", ApiVersion, "Microsoft.Compute.Extensions.json"),
            });
        var cache = TestSchemaCache.CreateFromFilePaths(paths);

        var schemas = cache.GetSchemasForProvider("Microsoft.Compute").SelectMany(group => group).ToArray();

        schemas.Select(schema => schema.FullyQualifiedResourceType)
            .Should().Contain("Microsoft.Compute/virtualMachines/extensions")
            .And.Contain("Microsoft.Compute/virtualMachineScaleSets/extensions");
    }

    [TestMethod]
    [DataRow(true)]
    [DataRow(false)]
    public void Generation_writes_companion_schemas_and_resolvable_root_references(bool singleProvider)
    {
        var output = Path.Combine(Path.GetTempPath(), "ComputeExtensionSchemaTests", Guid.NewGuid().ToString("N"));
        try
        {
            var generator = new MainGenerator(new FileSystem(), CreateResourceTypeProvider());
            generator.Generate(new(output, singleProvider ? "Microsoft.Compute" : null, UpdateRootSchemas: true));

            var schema = JsonNode.Parse(File.ReadAllText(Path.Combine(output, ApiVersion, "Microsoft.Compute.json")))!;
            var extensions = JsonNode.Parse(File.ReadAllText(Path.Combine(output, ApiVersion, "Microsoft.Compute.Extensions.json")))!;
            schema["resourceDefinitions"]!.AsObject().Select(resource => resource.Key)
                .Should().BeEquivalentTo("virtualMachines", "virtualMachineScaleSets");
            extensions["resourceDefinitions"]!.AsObject().Select(resource => resource.Key)
                .Should().BeEquivalentTo("virtualMachines_extensions", "virtualMachineScaleSets_extensions");

            var root = JsonNode.Parse(File.ReadAllText(Path.Combine(output, "common", "autogeneratedResources.json")))!;
            var references = root["resourceGroup"]!.AsArray()
                .Select(reference => reference!["$ref"]!.GetValue<string>()).ToArray();
            references.Should().HaveCount(4);
            references.Should().Contain($"{ExtensionSchemaId}/resourceDefinitions/virtualMachines_extensions");
            references.Should().Contain($"{ExtensionSchemaId}/resourceDefinitions/virtualMachineScaleSets_extensions");

            foreach (var reference in references)
            {
                var uri = new Uri(reference);
                var filePath = Path.Combine(output, uri.AbsolutePath["/schemas/".Length..].Replace('/', Path.DirectorySeparatorChar));
                var target = JsonNode.Parse(File.ReadAllText(filePath));
                foreach (var segment in uri.Fragment["#/".Length..].Split('/'))
                {
                    target = target![segment];
                }

                target.Should().NotBeNull();
            }
        }
        finally
        {
            if (Directory.Exists(output))
            {
                Directory.Delete(output, recursive: true);
            }
        }
    }

    private static ResourceTypeProvider CreateResourceTypeProvider()
    {
        var loader = new AzTypeLoader();
        var index = loader.LoadTypeIndex();
        var resources = index.Resources
            .Where(resource => ResourceTypes.Contains(resource.Key.Split('@')[0], StringComparer.OrdinalIgnoreCase) &&
                resource.Key.EndsWith($"@{ApiVersion}", StringComparison.OrdinalIgnoreCase))
            .ToDictionary(resource => resource.Key, resource => resource.Value);
        resources.Should().HaveCount(ResourceTypes.Length);
        var dummyReference = new CrossFileTypeReference("dummy", 0);
        var mockLoader = new Mock<ITypeLoader>();
        mockLoader.Setup(mock => mock.LoadTypeIndex()).Returns(new TypeIndex(
            resources: resources,
            resourceFunctions: new Dictionary<string, IReadOnlyDictionary<string, IReadOnlyList<CrossFileTypeReference>>>(),
            namespaceFunctions: [],
            settings: new TypeSettings("dummy", "0", isSingleton: false, configurationType: dummyReference),
            fallbackResourceType: dummyReference));
        mockLoader.Setup(mock => mock.LoadResourceType(It.IsAny<CrossFileTypeReference>()))
            .Returns((CrossFileTypeReference reference) => loader.LoadResourceType(reference));
        return new ResourceTypeProvider(mockLoader.Object);
    }
}
