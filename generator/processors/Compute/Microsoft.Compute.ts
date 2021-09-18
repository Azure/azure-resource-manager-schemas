import { SchemaPostProcessor, ScopeType } from '../../models';

export const postProcessor: SchemaPostProcessor = (namespace: string, apiVersion: string, schema: any) => {
    const extensionsDefinitions = require("./ExtensionsDefinitionsTemplate.json");
    const extensionsProperties = require("./ExtensionsPropertiesTemplate.json");

    // Update extensionDefinitions ##APIVERSION## with apiVersion
    extensionsDefinitions.id = extensionsDefinitions.id.replace("##APIVERSION##", apiVersion);
    // Update extensionsProperties ##APIVERSION## with apiVersion
    for (let i = 0; i < extensionsProperties.anyOf.length; i++) {
        extensionsProperties.anyOf[i].$ref = extensionsProperties.anyOf[i].$ref.replace("##APIVERSION##", apiVersion);
    }

    // Set schema.resourceDefinitions.virtualMachines_extensions.properties.properties = $extensionsProperties
    if (schema.resourceDefinitions?.virtualMachines_extensions?.properties?.properties) {
        schema.resourceDefinitions.virtualMachines_extensions.properties.properties = extensionsProperties;
    }
    // Set schema.resourceDefinitions.virtualMachineScaleSets_extensions.properties.properties = $extensionsProperties
    if (schema.resourceDefinitions?.virtualMachineScaleSets_extensions?.properties?.properties) {
        schema.resourceDefinitions.virtualMachineScaleSets_extensions.properties.properties = extensionsProperties;
    }
    // Set schema.definitions.virtualMachines_extensions_childResource.properties.properties = $extensionsProperties
    if (schema.definitions.virtualMachines_extensions_childResource?.properties?.properties) {
        schema.definitions.virtualMachines_extensions_childResource.properties.properties = extensionsProperties;
    }
    // Set schema.definitions.VirtualMachineScaleSetExtension.properties.properties = $extensionsProperties
    if (schema.definitions.VirtualMachineScaleSetExtension?.properties?.properties) {
        schema.definitions.VirtualMachineScaleSetExtension.properties.properties = extensionsProperties;
    }

    // set extensionsDefinitions.resourceDefinitions.virtualMachines_extensions = schema.resourceDefinitions.virtualMachines_extensions
    extensionsDefinitions.resourceDefinitions.virtualMachines_extensions = schema.resourceDefinitions.virtualMachines_extensions
    // set extensionsDefinitions.resourceDefinitions.virtualMachineScaleSets_extensions = schema.resourceDefinitions.virtualMachineScaleSets_extensions
    extensionsDefinitions.resourceDefinitions.virtualMachineScaleSets_extensions = schema.resourceDefinitions.virtualMachineScaleSets_extensions

    // remove schema.resourceDefinitions.virtualMachines_extensions
    delete schema.resourceDefinitions.virtualMachines_extensions
    // remove schema.resourceDefinitions.virtualMachineScaleSets_extensions
    delete schema.resourceDefinitions.virtualMachineScaleSets_extensions

    // save schema as Microsoft.Compute.json
    // save extensionsDefinitions as Microsoft.ComputeExtensions.json
    var extensionFile = "../../../schemas/" + apiVersion + "/Microsoft.Compute.Extensions.json";
    var fs = require('fs');
    const data = JSON.stringify(extensionsDefinitions, null, 2);
    fs.writeFileSync(extensionFile, data);
}