// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using System.Text.Json.Nodes;
using FluentAssertions;

namespace TemplateSchemaGenerator.Tests;

[TestClass]
public class SpecialCaseRewriterTests
{
    [TestMethod]
    public void ServiceFabric_special_case_rewriter_canonicalizes_IPTag_references()
    {
        var schema = new JsonObject
        {
            ["definitions"] = new JsonObject
            {
                ["IPTag"] = new JsonObject { ["type"] = "object" },
                ["IpTag"] = new JsonObject { ["type"] = "object" },
                ["RefContainer"] = new JsonObject
                {
                    ["oneOf"] = new JsonArray
                    {
                        new JsonObject { ["$ref"] = "#/definitions/IpTag" },
                        new JsonObject { ["$ref"] = "#/definitions/IPTag" },
                    },
                },
            },
        };

        SpecialCaseRewriter.Rewrite("Microsoft.ServiceFabric", schema);

        var definitions = schema["definitions"]!.AsObject();
        Assert.IsTrue(definitions.ContainsKey("IPTag"));
        Assert.IsFalse(definitions.ContainsKey("IpTag"));
        definitions["RefContainer"]!["oneOf"]![0]!["$ref"]!.GetValue<string>().Should().Be("#/definitions/IPTag");
        definitions["RefContainer"]!["oneOf"]![1]!["$ref"]!.GetValue<string>().Should().Be("#/definitions/IPTag");
    }

    [TestMethod]
    public void ServiceFabric_special_case_rewriter_opens_ServicePlacementPolicyDescription()
    {
        var schema = new JsonObject
        {
            ["definitions"] = new JsonObject
            {
                ["ServicePlacementPolicyDescription"] = new JsonObject
                {
                    ["allOf"] = new JsonArray
                    {
                        new JsonObject
                        {
                            ["properties"] = new JsonObject
                            {
                                ["Type"] = new JsonObject { ["enum"] = new JsonArray() },
                            },
                        },
                    },
                },
            },
        };

        SpecialCaseRewriter.Rewrite("Microsoft.ServiceFabric", schema);

        var expected = new JsonObject
        {
            ["description"] = "Describes the policy to be used for placement of a Service Fabric service.",
            ["properties"] = new JsonObject(),
            ["type"] = "object",
        };
        JsonNode.DeepEquals(schema["definitions"]!["ServicePlacementPolicyDescription"], expected).Should().BeTrue();
    }

    [TestMethod]
    public void ServiceFabric_special_case_rewriter_does_not_rewrite_other_providers()
    {
        var schema = new JsonObject
        {
            ["definitions"] = new JsonObject
            {
                ["IPTag"] = new JsonObject { ["type"] = "object" },
                ["IpTag"] = new JsonObject { ["type"] = "object" },
            },
            ["$ref"] = "#/definitions/IpTag",
        };

        SpecialCaseRewriter.Rewrite("Microsoft.Network", schema);

        schema["definitions"]!.AsObject().ContainsKey("IpTag").Should().BeTrue();
        schema["$ref"]!.GetValue<string>().Should().Be("#/definitions/IpTag");
    }
}