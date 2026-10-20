// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using System.Text.Json.Nodes;

namespace TemplateSchemaGenerator;

internal static class ComputeExtensionSchema
{
    private const string ProviderNamespace = "Microsoft.Compute";
    internal const string ExtensionProviderNamespace = "Microsoft.Compute.Extensions";

    private static readonly string[] ResourceKeys = ["virtualMachines_extensions", "virtualMachineScaleSets_extensions"];

    private static readonly string[] ResourceSections =
    [
        "resourceDefinitions",
        "subscription_resourceDefinitions",
        "managementGroup_resourceDefinitions",
        "tenant_resourceDefinitions",
        "unknown_resourceDefinitions",
    ];

    private static readonly JsonObject ExtensionDefinitions = LoadDefinitions();

    internal static bool IsExtensionResource(string providerNamespace, string definitionKey)
        => providerNamespace.Equals(ProviderNamespace, StringComparison.OrdinalIgnoreCase) &&
            ResourceKeys.Contains(definitionKey, StringComparer.OrdinalIgnoreCase);

    internal static void Rewrite(JsonObject schema, string apiVersion)
    {
        foreach (var section in ResourceSections)
        {
            foreach (var key in ResourceKeys)
            {
                RewriteProperties(schema[section]?[key], apiVersion);
            }
        }

        foreach (var key in new[]
        {
            "virtualMachines_extensions_childResource",
            "virtualMachineScaleSets_extensions_childResource",
            "VirtualMachineScaleSetExtension",
        })
        {
            RewriteProperties(schema["definitions"]?[key], apiVersion);
        }
    }

    internal static JsonObject Extract(JsonNode schema, string apiVersion)
    {
        var extensionSchema = new JsonObject
        {
            ["id"] = $"https://schema.management.azure.com/schemas/{Utils.GetSchemaPath(apiVersion, ExtensionProviderNamespace)}#",
            ["$schema"] = "http://json-schema.org/draft-04/schema#",
            ["title"] = ExtensionProviderNamespace,
            ["description"] = "Microsoft Compute Extensions Resource Types",
            ["resourceDefinitions"] = new JsonObject(),
            ["definitions"] = ExtensionDefinitions.DeepClone(),
        };

        foreach (var section in ResourceSections)
        {
            if (schema[section] is not JsonObject resources)
            {
                continue;
            }

            foreach (var key in ResourceKeys)
            {
                if (resources[key] is not JsonObject resource)
                {
                    continue;
                }

                resources.Remove(key);
                // Local references in a moved resource still belong to the main provider schema.
                QualifyDefinitionReferences(resource, schema["id"]!.GetValue<string>());
                if (extensionSchema[section] is not JsonObject extensionResources)
                {
                    extensionResources = new JsonObject();
                    extensionSchema[section] = extensionResources;
                }

                extensionResources[key] = resource;
            }
        }

        return extensionSchema;
    }

    private static JsonObject LoadDefinitions()
    {
        using var stream = typeof(ComputeExtensionSchema).Assembly.GetManifestResourceStream("Microsoft.Compute.Extensions.json")
            ?? throw new InvalidOperationException("The Compute extension schema definitions are missing.");
        return JsonNode.Parse(stream)!.AsObject();
    }

    private static void RewriteProperties(JsonNode? resource, string apiVersion)
    {
        if (resource?["properties"] is not JsonObject properties || !properties.ContainsKey("properties"))
        {
            return;
        }

        properties["properties"] = new JsonObject
        {
            ["anyOf"] = new JsonArray(ExtensionDefinitions.Select(definition => (JsonNode)new JsonObject
            {
                ["$ref"] = $"https://schema.management.azure.com/schemas/{Utils.GetSchemaPath(apiVersion, ExtensionProviderNamespace)}#/definitions/{definition.Key}",
            }).ToArray()),
        };
    }

    private static void QualifyDefinitionReferences(JsonNode? node, string schemaId)
    {
        if (node is JsonObject obj)
        {
            if (obj["$ref"] is JsonValue value &&
                value.TryGetValue<string>(out var reference) &&
                reference.StartsWith("#/", StringComparison.Ordinal))
            {
                obj["$ref"] = schemaId.TrimEnd('#') + reference;
            }

            foreach (var child in obj.Select(property => property.Value).ToArray())
            {
                QualifyDefinitionReferences(child, schemaId);
            }
        }
        else if (node is JsonArray array)
        {
            foreach (var child in array)
            {
                QualifyDefinitionReferences(child, schemaId);
            }
        }
    }
}
