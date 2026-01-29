// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Abstractions;
using System.Linq;
using Azure.Bicep.Types;
using Azure.Bicep.Types.Concrete;

namespace TemplateSchemaGenerator;

public class ResourceTypeProvider
{
    private readonly ITypeLoader loader;
    private readonly IReadOnlyDictionary<string, CrossFileTypeReference> resources;

    public ResourceTypeProvider(IFileSystem fileSystem, string sourceFolder)
        : this(new AzTypeLoader(fileSystem, sourceFolder))
    {
    }

    public ResourceTypeProvider(ITypeLoader loader)
    {
        this.loader = loader;
        resources = loader.LoadTypeIndex().Resources
            .ToDictionary(kvp => kvp.Key, kvp => kvp.Value, StringComparer.OrdinalIgnoreCase);
    }

    public ResourceType Get(string resourceType, string apiVersion)
    {
        var resourceTypeKey = $"{resourceType}@{apiVersion}";
        if (!resources.TryGetValue(resourceTypeKey, out var typeReference))
        {
            throw new InvalidOperationException($"Could not find type for {resourceType} {apiVersion}");
        }

        return loader.LoadResourceType(typeReference);
    }

    public IEnumerable<(string resourceType, string apiVersion)> GetResourceTypes()
    {
        foreach (var key in resources.Keys)
        {
            var splitResult = key.Split('@', 2);

            yield return (splitResult[0], splitResult[1]);
        }
    }

    private class AzTypeLoader : TypeLoader
    {
        private readonly IFileSystem fileSystem;
        private readonly string baseFilePath;

        public AzTypeLoader(IFileSystem fileSystem, string baseFilePath)
        {
            this.fileSystem = fileSystem;
            this.baseFilePath = baseFilePath;
        }

        protected override Stream GetContentStreamAtPath(string path)
        {
            var filePath = Path.Combine(baseFilePath, path);

            return fileSystem.File.OpenRead(filePath);
        }
    }
}
