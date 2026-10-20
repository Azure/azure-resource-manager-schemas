// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { SchemaPostProcessor } from '../models';
import extensionDefinitions from './Microsoft.Compute.Extensions.json';

export const postProcessor: SchemaPostProcessor = async (namespace, apiVersion, schema, onSave) => {
    const extensionsDefinitions = extensionsDefinition(apiVersion);

    // Set schema.resourceDefinitions.virtualMachines_extensions.properties.properties = $extensionsProperties
    if (schema.resourceDefinitions?.virtualMachines_extensions?.properties?.properties) {
        schema.resourceDefinitions.virtualMachines_extensions.properties.properties = extensionsProperties(apiVersion);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (extensionsDefinitions.resourceDefinitions as any).virtualMachines_extensions = schema.resourceDefinitions.virtualMachines_extensions;
        
        // remove schema.resourceDefinitions.virtualMachines_extensions
        delete schema.resourceDefinitions.virtualMachines_extensions;
    }

    // Set schema.resourceDefinitions.virtualMachineScaleSets_extensions.properties.properties = $extensionsProperties
    if (schema.resourceDefinitions?.virtualMachineScaleSets_extensions?.properties?.properties) {
        schema.resourceDefinitions.virtualMachineScaleSets_extensions.properties.properties = extensionsProperties(apiVersion);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (extensionsDefinitions.resourceDefinitions as any).virtualMachineScaleSets_extensions = schema.resourceDefinitions.virtualMachineScaleSets_extensions;

        // remove schema.resourceDefinitions.virtualMachineScaleSets_extensions
        delete schema.resourceDefinitions.virtualMachineScaleSets_extensions
    }

    // Set schema.definitions.virtualMachines_extensions_childResource.properties.properties = $extensionsProperties
    if (schema.definitions.virtualMachines_extensions_childResource?.properties?.properties) {
        schema.definitions.virtualMachines_extensions_childResource.properties.properties = extensionsProperties(apiVersion);
    }

    // Set schema.definitions.VirtualMachineScaleSetExtension.properties.properties = $extensionsProperties
    if (schema.definitions.VirtualMachineScaleSetExtension?.properties?.properties) {
        schema.definitions.VirtualMachineScaleSetExtension.properties.properties = extensionsProperties(apiVersion);
    }

    /// Remove CloudService Update Domain
    if (schema.resourceDefinitions?.cloudServices_updateDomains) {
        delete schema.resourceDefinitions.cloudServices_updateDomains;
    }
    if (schema.resourceDefinitions?.cloudServices?.properties?.resources) {
        delete schema.resourceDefinitions.cloudServices.properties.resources
    }
    if (schema.definitions?.cloudServices_updateDomains_childResource) {
        delete schema.definitions?.cloudServices_updateDomains_childResource
    }

    // save extensionsDefinitions as Microsoft.Compute.Extensions.json
    await onSave('Microsoft.Compute.Extensions.json', extensionsDefinitions);
}

const extensionsDefinition = (apiVersion: string) => ({
    id: `https://schema.management.azure.com/schemas/${apiVersion}/Microsoft.Compute.Extensions.json#`,
    $schema: 'http://json-schema.org/draft-04/schema#',
    title: 'Microsoft.Compute.Extensions',
    description: 'Microsoft Compute Extensions Resource Types',
    resourceDefinitions: {},
    definitions: extensionDefinitions,
});

const extensionsProperties = (apiVersion: string) => (
    {
        anyOf: Object.keys(extensionDefinitions).map(definition => ({
            $ref: `https://schema.management.azure.com/schemas/${apiVersion}/Microsoft.Compute.Extensions.json#/definitions/${definition}`,
        }))
    });
