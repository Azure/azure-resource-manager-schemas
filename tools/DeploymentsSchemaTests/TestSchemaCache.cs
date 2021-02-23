using Azure.Deployments.Core.Components;
using Azure.Deployments.Core.Extensions;
using Azure.Deployments.Core.Resources;
using Azure.Deployments.Templates.Contracts;
using Azure.Deployments.Templates.Export;
using Azure.Deployments.Templates.Extensions;
using Azure.Deployments.Templates.Helpers;
using Azure.Deployments.TemplateSchemas;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace DeploymentsSchemaTests
{
    /// <summary>
    /// Test schema cache
    /// </summary>
    internal class TestSchemaCache : INormalizedSchemaCache
    {
        /// <summary>
        /// Initializes the schema cache from a set of file paths.
        /// </summary>
        /// <param name="filePaths">The file paths to load.</param>
        public static INormalizedSchemaCache CreateFromFilePaths(IEnumerable<string> filePaths)
        {
            var schemaResults = TestSchemaCache.BuildSchemaCacheFromFilePaths(filePaths);

            return new TestSchemaCache(schemaResults);
        }

        private TestSchemaCache(ResultWithErrors<ResourceTypeSchema[]> schemaResults)
        {
            if (schemaResults.Errors.Any())
            {
                var errors = schemaResults.Errors
                    .Where(err => !SchemaLoader.CircularReferenceSchemas.Contains(err.Target))
                    .ToArray();

                if (errors.Any())
                {
                    var errorsJson = JsonConvert.SerializeObject(errors, Formatting.Indented);
                    throw new InvalidOperationException($"Found errors building normalized cache: {errorsJson}");
                }
            }

            this.schemaCache = schemaResults.Value
                .GroupByOrdinalInsensitively(schema => schema.ResourceProviderNamespace)
                .ToDictionary(
                    keySelector: grouping => grouping.Key,
                    elementSelector: grouping => grouping.ToLookupOrdinalInsensitively(schema => schema.FullyQualifiedResourceType),
                    comparer: StringComparer.OrdinalIgnoreCase);
        }

        private IReadOnlyDictionary<string, ILookup<string, ResourceTypeSchema>> schemaCache;

        private class OfflineSchema : IResourceProviderSchema
        {
            public OfflineSchema(string providerNamespace, string apiVersion, JToken schemaContent)
            {
                this.ResourceProviderNamespace = providerNamespace;
                this.SchemaVersion = apiVersion;
                this.SchemaContent = schemaContent;
            }

            public string ResourceProviderNamespace { get; }

            public string SchemaVersion { get; }

            public JToken SchemaContent { get; }
        }

        private static readonly Uri SchemaBaseUri = new Uri("https://schema.management.azure.com/schemas/");

        private static string GetRelativeSchemaPath(string schemaId)
        {
            var schemaUri = new Uri(new Uri(schemaId).GetLeftPart(UriPartial.Path));
            if (!SchemaBaseUri.IsBaseOf(schemaUri))
            {
                throw new ArgumentException($"Unable to process schema {schemaUri}");
            }

            return SchemaBaseUri.MakeRelativeUri(schemaUri).ToString();
        }

        private static ResultWithErrors<ResourceTypeSchema[]> BuildSchemaCacheFromFilePaths(IEnumerable<string> filePaths)
        {
            var schemasByPath = filePaths
                .Select(File.ReadAllText)
                .Select(JObject.Parse)
                .ToInsensitiveDictionary(
                    keySelector: schema => GetRelativeSchemaPath(schema["id"].ToObject<string>()),
                    elementSelector: schema => schema as JToken);

            var externalReferenceSchemasResult = SchemaUtils.GetExternalReferenceSchemas(schemasByPath, SchemaUtils.ExternalReferenceWhitelist.ToArray());
            if (externalReferenceSchemasResult.Errors.Any())
            {
                throw new InvalidOperationException($"Failed to initialize the offline schemas cache");
            }

            var schemaRefsByFile = SchemaUtils.TopLevelReferenceSchemas
                .SelectMany(schemaPath => SchemaUtils.GetExternalReferences(schemasByPath[schemaPath]))
                .Select(property => property.Value.ToObject<string>())
                .ToLookupOrdinalInsensitively(SchemaUtils.GetFilePathFromUri);

            var schemaKeysFound = schemaRefsByFile
                .Select(grouping => grouping.Key)
                .Where(filePath => !SchemaUtils.ExternalReferenceWhitelist.Contains(filePath))
                .Where(filePath => schemasByPath.ContainsKey(filePath))
                .ToArray();

            var schemaGroups = schemaKeysFound.GroupByInsensitively(keySelector: schemaKey => SchemaUtils.GetSchemaGroupKey(schemaKey));

            var schemaNormalizationResults = schemaGroups
                .Select(schemaGroup => schemaGroup.ToInsensitiveDictionary(keySelector: schemaKey => schemaKey, elementSelector: schemaKey => schemasByPath[schemaKey]))
                .SelectMany(schemaGroup => SchemaUtils.NormalizeAndFilterSchemaGroup(
                    schemaGroup: schemaGroup,
                    externalReferenceSchemas: externalReferenceSchemasResult.Value,
                    schemaRefsByFile: schemaRefsByFile))
                .ToInsensitiveDictionary(
                    keySelector: normalizationResult => normalizationResult.Key,
                    elementSelector: normalizationResult => normalizationResult.Value);

            var resourceTypeSchemasResults = schemaNormalizationResults
                .Where(kvp => kvp.Value.Value != null)
                .Select(kvp => new OfflineSchema(
                    providerNamespace: SchemaUtils.GetProviderNamespaceFromSchemaKey(kvp.Key),
                    apiVersion: SchemaUtils.GetVersionFromSchemaKey(kvp.Key),
                    schemaContent: kvp.Value.Value))
                .Select(schema => schema.GetResourceTypeSchemasResult());

            return new ResultWithErrors<ResourceTypeSchema[]>
            {
                Value = resourceTypeSchemasResults.CollectValues().ToArray(),
                Errors = schemaNormalizationResults.Values.CollectErrors()
                    .ConcatArray(resourceTypeSchemasResults.CollectErrors()),
            };
        }

        /// <inheritdoc/>
        public ILookup<string, ResourceTypeSchema> GetSchemasForProvider(string providerNamespace)
        {
            if (this.schemaCache.TryGetValue(providerNamespace, out var schemaLookup))
            {
                return schemaLookup;
            }

            return Enumerable.Empty<ResourceTypeSchema>().ToLookupOrdinalInsensitively(schema => schema.FullyQualifiedResourceType);
        }

        /// <inheritdoc/>
        public IEnumerable<ResourceTypeSchema> GetSchemasForResourceType(string fullyQualifiedResourceType)
        {
            var providerNamespace = IResourceIdentifiableExtensions.GetNamespaceFromFullyQualifiedType(fullyQualifiedResourceType);

            if (!this.schemaCache.TryGetValue(providerNamespace, out var schemaLookup))
            {
                return Enumerable.Empty<ResourceTypeSchema>();
            }

            return schemaLookup[fullyQualifiedResourceType];
        }
    }
}
