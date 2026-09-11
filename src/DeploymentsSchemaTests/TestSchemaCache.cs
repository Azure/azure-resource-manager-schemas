// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Azure.Deployments.Core.Components;
using Azure.Deployments.Core.Extensions;
using Azure.Deployments.Core.Resources;
using Azure.Deployments.Templates.Contracts;
using Azure.Deployments.Templates.Export;
using Azure.Deployments.Templates.Extensions;
using Azure.Deployments.Templates.Helpers;
using Microsoft.WindowsAzure.ResourceStack.Common.Extensions;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Concurrent;
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
        public HashSet<string> CircularReferenceSchemas { get; } = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            // This list should be kept in-sync with the product code
            "Microsoft.Media/2018-07-01",
            "Microsoft.DataFactory/2017-09-01-preview",
            "Microsoft.DataFactory/2018-06-01",
        };

        /// <summary>
        /// Initializes the schema cache from a set of file paths. Parsing and normalization for a given
        /// provider is deferred until that provider is actually requested, so the full schema corpus is never
        /// fully parsed/normalized in memory at once.
        /// </summary>
        /// <param name="filePaths">The file paths to load.</param>
        public static TestSchemaCache CreateFromFilePaths(IEnumerable<string> filePaths)
            => new(filePaths);

        private TestSchemaCache(IEnumerable<string> filePaths)
        {
            var filePathByRelativeKey = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            foreach (var filePath in filePaths)
            {
                var apiVersionOrCommonFolder = Path.GetFileName(Path.GetDirectoryName(filePath)) ?? string.Empty;
                filePathByRelativeKey[$"{apiVersionOrCommonFolder}/{Path.GetFileName(filePath)}"] = filePath;
            }

            // Only the small, fixed whitelist of top-level/common schemas is parsed up front. Their $ref lists
            // are what the external SchemaUtils normalization uses to discover which schema keys exist and how
            // they group together (e.g. Microsoft.Compute.json + Microsoft.Compute.Extensions.json), so we
            // reuse the same discovery logic here without ever parsing the full (multi-thousand-file) corpus.
            var alwaysIncludedKeys = SchemaUtils.ExternalReferenceWhitelist
                .Concat(SchemaUtils.TopLevelReferenceSchemas)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToArray();

            var commonFilePaths = alwaysIncludedKeys
                .Where(filePathByRelativeKey.ContainsKey)
                .Select(key => filePathByRelativeKey[key])
                .ToArray();

            var whitelistContentByKey = new Dictionary<string, JToken>(StringComparer.OrdinalIgnoreCase);
            foreach (var path in commonFilePaths)
            {
                var content = JObject.Parse(File.ReadAllText(path));
                whitelistContentByKey[GetRelativeSchemaPath(content["id"].ToObject<string>())] = content;
            }

            var schemaRefsByFile = SchemaUtils.TopLevelReferenceSchemas
                .SelectMany(schemaPath => SchemaUtils.GetExternalReferences(whitelistContentByKey[schemaPath]))
                .Select(property => property.Value.ToObject<string>())
                .ToLookupOrdinalInsensitively(SchemaUtils.GetFilePathFromUri);

            var schemaKeysFound = schemaRefsByFile
                .Select(grouping => grouping.Key)
                .Where(schemaKey => !SchemaUtils.ExternalReferenceWhitelist.Contains(schemaKey))
                .Where(filePathByRelativeKey.ContainsKey)
                .Distinct(StringComparer.OrdinalIgnoreCase);

            var groupKeysByProviderKey = new Dictionary<string, HashSet<string>>(StringComparer.OrdinalIgnoreCase);
            var relativeKeysByGroupKey = new Dictionary<string, HashSet<string>>(StringComparer.OrdinalIgnoreCase);

            foreach (var schemaKey in schemaKeysFound)
            {
                var groupKey = SchemaUtils.GetSchemaGroupKey(schemaKey);
                if (!relativeKeysByGroupKey.TryGetValue(groupKey, out var relativeKeysInGroup))
                {
                    relativeKeysInGroup = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
                    relativeKeysByGroupKey.Add(groupKey, relativeKeysInGroup);
                }

                relativeKeysInGroup.Add(schemaKey);

                var providerKey = SchemaUtils.GetProviderNamespaceFromSchemaKey(schemaKey);
                if (!groupKeysByProviderKey.TryGetValue(providerKey, out var groupKeysForProvider))
                {
                    groupKeysForProvider = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
                    groupKeysByProviderKey.Add(providerKey, groupKeysForProvider);
                }

                groupKeysForProvider.Add(groupKey);
            }

            this.commonFilePaths = commonFilePaths;
            this.filePathByRelativeKey = filePathByRelativeKey;
            this.groupKeysByProviderKey = groupKeysByProviderKey;
            this.relativeKeysByGroupKey = relativeKeysByGroupKey;
        }

        private readonly IReadOnlyList<string> commonFilePaths;
        private readonly IReadOnlyDictionary<string, string> filePathByRelativeKey;
        private readonly IReadOnlyDictionary<string, HashSet<string>> groupKeysByProviderKey;
        private readonly IReadOnlyDictionary<string, HashSet<string>> relativeKeysByGroupKey;
        private readonly ConcurrentDictionary<string, Lazy<ILookup<string, ResourceTypeSchema>>> schemasByProvider = new(StringComparer.OrdinalIgnoreCase);

        /// <summary>
        /// All provider keys discovered from the supplied file paths, excluding the shared common/top-level
        /// schemas. Used by tests that need to validate every provider without holding the whole corpus in
        /// memory at once.
        /// </summary>
        public IReadOnlyCollection<string> ProviderKeys => (IReadOnlyCollection<string>)this.groupKeysByProviderKey.Keys;

        private ILookup<string, ResourceTypeSchema> LoadProvider(string providerKey)
        {
            if (!this.groupKeysByProviderKey.TryGetValue(providerKey, out var groupKeys))
            {
                return Enumerable.Empty<ResourceTypeSchema>().ToLookupOrdinalInsensitively(schema => schema.FullyQualifiedResourceType);
            }

            var groupFilePaths = groupKeys
                .SelectMany(groupKey => this.relativeKeysByGroupKey[groupKey])
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .Select(relativeKey => this.filePathByRelativeKey[relativeKey]);

            var schemaResults = TestSchemaCache.BuildSchemaCacheFromFilePaths(
                this.commonFilePaths.Concat(groupFilePaths).Distinct(StringComparer.OrdinalIgnoreCase));

            if (schemaResults.Errors.Any())
            {
                var errors = schemaResults.Errors
                    .Where(err => !CircularReferenceSchemas.Contains(err.Target))
                    .ToArray();

                if (errors.Any())
                {
                    var errorsJson = JsonConvert.SerializeObject(errors, Formatting.Indented);
                    throw new InvalidOperationException($"Found errors building normalized cache for provider '{providerKey}': {errorsJson}");
                }
            }

            return schemaResults.Value
                .Where(schema => string.Equals(schema.ResourceProviderNamespace, providerKey, StringComparison.OrdinalIgnoreCase))
                .ToLookupOrdinalInsensitively(schema => schema.FullyQualifiedResourceType);
        }

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

        private static readonly Uri SchemaBaseUri = new("https://schema.management.azure.com/schemas/");

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

            var externalReferenceSchemasResult = SchemaUtils.GetExternalReferenceSchemas(schemasByPath, [.. SchemaUtils.ExternalReferenceWhitelist]);
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
                Value = [.. resourceTypeSchemasResults.CollectValues()],
                Errors = schemaNormalizationResults.Values.CollectErrors()
                    .ConcatArray(resourceTypeSchemasResults.CollectErrors()),
            };
        }

        /// <inheritdoc/>
        public ILookup<string, ResourceTypeSchema> GetSchemasForProvider(string providerNamespace)
            => this.schemasByProvider.GetOrAdd(
                providerNamespace,
                key => new Lazy<ILookup<string, ResourceTypeSchema>>(() => this.LoadProvider(key))).Value;

        /// <inheritdoc/>
        public IEnumerable<ResourceTypeSchema> GetSchemasForResourceType(string fullyQualifiedResourceType)
        {
            var providerNamespace = IResourceIdentifiableExtensions.GetNamespaceFromFullyQualifiedType(fullyQualifiedResourceType);

            return this.GetSchemasForProvider(providerNamespace)[fullyQualifiedResourceType];
        }
    }
}
