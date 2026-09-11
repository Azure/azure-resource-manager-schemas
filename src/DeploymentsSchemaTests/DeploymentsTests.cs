// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using FluentAssertions;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.IO;

namespace DeploymentsSchemaTests
{
    [TestClass]
    public class DeploymentsTests
    {
        [TestMethod]
        public void TestSchemaLoader()
        {
            var cache = TestSchemaCache.CreateFromFilePaths(
                filePaths: Directory.EnumerateFiles(
                    path: "schemas",
                    searchPattern: "*.json",
                    searchOption: SearchOption.AllDirectories));

            // Load and validate one provider at a time so the whole corpus is never fully parsed/normalized
            // in memory simultaneously.
            Action loadAllProvidersFunc = () =>
            {
                foreach (var providerKey in cache.ProviderKeys)
                {
                    cache.GetSchemasForProvider(providerKey);
                }
            };

            loadAllProvidersFunc.Should().NotThrow();
        }
    }
}
