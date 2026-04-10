// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using FluentAssertions;

namespace TemplateSchemaGenerator.Tests;

[TestClass]
public class DeploymentsTests
{
    [TestMethod]
    public void TestSchemaLoader()
    {
        Action createAssemblyFunc = () =>
            TestSchemaCache.CreateFromFilePaths(
                filePaths: Directory.EnumerateFiles(
                    path: "schemas",
                    searchPattern: "*.json",
                    searchOption: SearchOption.AllDirectories));
        createAssemblyFunc.Should().NotThrow();
    }
}
