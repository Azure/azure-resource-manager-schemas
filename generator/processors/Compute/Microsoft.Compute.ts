import { SchemaPostProcessor, ScopeType } from '../../models';
import { default as extensionsDefinitions } from './ExtensionsDefinitionsTemplate.json';
import { default as extensionsProperties } from './ExtensionsPropertiesTemplate.json';

export const postProcessor: SchemaPostProcessor = (namespace: string, apiVersion: string, schema: any) => {
    // Update extensionDefinitions ##APIVERSION## with apiVersion

    // Update extensionsProperties ##APIVERSION## with apiVersion


    // Set schema.resourceDefinitions.virtualMachines_extensions.properties.properties = $extensionsProperties
    // Set schema.resourceDefinitions.virtualMachineScaleSets_extensions.properties.properties = $extensionsProperties
    // Set schema.definitions.virtualMachines_extensions_childResource.properties.properties = $extensionsProperties
    // Set schema.definitions.VirtualMachineScaleSetExtension.properties.properties = $extensionsProperties


    // set extensionsDefinitions.resourceDefinitions.virtualMachines_extensions = schema.resourceDefinitions.virtualMachines_extensions
    // set extensionsDefinitions.resourceDefinitions.virtualMachineScaleSets_extensions = schema.resourceDefinitions.virtualMachineScaleSets_extensions


    // remove schema.resourceDefinitions.virtualMachines_extensions
    // remove schema.resourceDefinitions.virtualMachineScaleSets_extensions

    // save schema as Microsoft.Compute.json
    // save extensionsDefinitions as Microsoft.ComputeExtensions.json
}