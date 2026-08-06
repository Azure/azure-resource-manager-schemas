// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using System.Text.Json.Nodes;

namespace TemplateSchemaGenerator;

internal static class SpecialCaseRewriter
{
    public static void Rewrite(string providerNamespace, JsonObject schema)
    {
        if (providerNamespace.Equals("Microsoft.ServiceFabric", StringComparison.OrdinalIgnoreCase))
        {
            RewriteServiceFabric(schema);
        }
    }

    private static void RewriteServiceFabric(JsonObject schema)
    {
        if (schema["definitions"] is not JsonObject definitions)
        {
            return;
        }

        if (definitions.ContainsKey("IPTag"))
        {
            RewriteDefinitionRef(schema, "IpTag", "IPTag");
            definitions.Remove("IpTag");
        }

        if (definitions.ContainsKey("ServicePlacementPolicyDescription"))
        {
            definitions["ServicePlacementPolicyDescription"] = new JsonObject
            {
                ["description"] = "Describes the policy to be used for placement of a Service Fabric service.",
                ["properties"] = new JsonObject(),
                ["type"] = "object",
            };
        }
    }

    private static void RewriteDefinitionRef(JsonNode? node, string definitionName, string replacementName)
    {
        if (node is JsonObject obj)
        {
            if (obj["$ref"]?.GetValue<string>() == $"#/definitions/{definitionName}")
            {
                obj["$ref"] = $"#/definitions/{replacementName}";
            }

            foreach (var child in obj.Select(property => property.Value).ToArray())
            {
                RewriteDefinitionRef(child, definitionName, replacementName);
            }
        }
        else if (node is JsonArray array)
        {
            foreach (var child in array.ToArray())
            {
                RewriteDefinitionRef(child, definitionName, replacementName);
            }
        }
    }
}