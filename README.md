# azure-resource-manager-schemas 

This is the repo for template deployment schemas hosted at:  https://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json

Welcome to contribute to template deployment schemas, please send pull request to improve the schemas. We will review the pull request and publish the latest schemas to http://schema.management.azure.com/schemas

## Hints:
* When you add a new resource type in schema, please add it into [schemas\2014-04-01-preview\deploymentTemplate.json](https://github.com/Azure/azure-resource-manager-schemas/blob/master/schemas/2014-04-01-preview/deploymentTemplate.json) and [schemas\2015-01-01\deploymentTemplate.json](https://github.com/Azure/azure-resource-manager-schemas/blob/master/schemas/2015-01-01/deploymentTemplate.json)
* Please add or update [tests](https://github.com/Azure/azure-resource-manager-schemas/tree/master/tests) for your change.
* Please test your change with following two node.js scripts:
  1. [tools\validateJSON.js](https://github.com/Azure/azure-resource-manager-schemas/blob/master/tools/validateJSON.js) and [ResourceMetaSchema.json](https://github.com/Azure/azure-resource-manager-schemas/blob/master/tools/ResourceMetaSchema.json):  
The script uses the ResourceMetaSchema.json to do some basic checks against the new/updated schema file.  
**Usage:**   
Node validateJSON.js \<schema file path\> ResourceMetaSchema.json \<shcema folder path\>  
**Sample:**  
Node validateJSON.js ..\schemas\2015-08-01\Microsoft.Compute.json ResourceMetaSchema.json ..\schemas\  
  2. [tools\runSchemaTests.js](https://github.com/Azure/azure-resource-manager-schemas/blob/master/tools/runSchemaTests.js)  
The script uses all test JSON files under [tests](https://github.com/Azure/azure-resource-manager-schemas/tree/master/tests) folder to test against the schema files.  
**Usage:**   
Node runSchemaTests.js
