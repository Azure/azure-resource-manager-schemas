// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Abstractions;
using Azure.Bicep.Types;
using Azure.Bicep.Types.Concrete;
using Azure.Bicep.Types.Index;
using FluentAssertions;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace TemplateSchemaGenerator.Tests;

[TestClass]
public class OutputPreservationTests
{
    [TestMethod]
    public void Full_generation_preserves_hand_authored_schemas()
    {
        var tempRoot = Path.Combine(Path.GetTempPath(), "TemplateSchemaGeneratorTests", Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(tempRoot);

        try
        {
            var outputFolder = Path.Combine(tempRoot, "schemas");
            var apiVersionFolder = Path.Combine(outputFolder, "2020-01-01");
            Directory.CreateDirectory(apiVersionFolder);

            var preservedCreateUiDefinition = Path.Combine(apiVersionFolder, "CreateUIDefinition.Foo.json");
            var preservedDeploymentTemplate = Path.Combine(apiVersionFolder, "deploymentTemplate.json");
            var generatedToDelete = Path.Combine(apiVersionFolder, "Microsoft.Foo.json");

            File.WriteAllText(preservedCreateUiDefinition, "{ 'preserved': 'CreateUIDefinition' }");
            File.WriteAllText(preservedDeploymentTemplate, "{ 'preserved': 'deploymentTemplate' }");
            File.WriteAllText(generatedToDelete, "{ 'delete': true }");

            IFileSystem fileSystem = new FileSystem();
            var resourceTypeProvider = new ResourceTypeProvider(new EmptyTypeLoader());
            var generator = new MainGenerator(fileSystem, resourceTypeProvider);

            generator.Generate(new(outputFolder, ProviderNamespace: null));

            File.Exists(preservedCreateUiDefinition).Should().BeTrue();
            File.Exists(preservedDeploymentTemplate).Should().BeTrue();
            File.Exists(generatedToDelete).Should().BeFalse();
        }
        finally
        {
            if (Directory.Exists(tempRoot))
            {
                Directory.Delete(tempRoot, recursive: true);
            }
        }
    }

    private sealed class EmptyTypeLoader : ITypeLoader
    {
        public ResourceType LoadResourceType(CrossFileTypeReference reference) => throw new NotSupportedException();

        public ResourceFunctionType LoadResourceFunctionType(CrossFileTypeReference reference) => throw new NotSupportedException();

        public TypeIndex LoadTypeIndex()
        {
            var dummyRef = new CrossFileTypeReference("dummy", 0);
            var dummySettings = new TypeSettings("dummy", "0", isSingleton: false, configurationType: dummyRef);

            return new TypeIndex(
                resources: new Dictionary<string, CrossFileTypeReference>(StringComparer.OrdinalIgnoreCase),
                resourceFunctions: new Dictionary<string, IReadOnlyDictionary<string, IReadOnlyList<CrossFileTypeReference>>>(StringComparer.OrdinalIgnoreCase),
                settings: dummySettings,
                fallbackResourceType: dummyRef);
        }

        public TypeBase LoadType(CrossFileTypeReference reference) => throw new NotSupportedException();
    }
}
