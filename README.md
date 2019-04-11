# azure-resource-manager-schemas 

This is the repo for template deployment schemas hosted at https://schema.management.azure.com/.

Welcome to contribute to template deployment schemas, please send pull request to improve the schemas. We will review the pull request and publish the latest schemas to https://schema.management.azure.com/schemas

## Hints:
* When you add a new resource type in schema, please add it into [schemas\2014-04-01-preview\deploymentTemplate.json](schemas/2014-04-01-preview/deploymentTemplate.json), [schemas\2015-01-01\deploymentTemplate.json](schemas/2015-01-01/deploymentTemplate.json) and [schemas\2019-04-01\deploymentTemplate.json](schemas/2019-04-01/deploymentTemplate.json).
* Please add or update [tests](tests/) for your change.
* Please test your change with following two node.js scripts:
  1. [tools\validateJSON.js](tools/validateJSON.js) and [ResourceMetaSchema.json](tools/ResourceMetaSchema.json):  
The script uses the ResourceMetaSchema.json to do some basic checks against the new/updated schema file.  
**Usage:**   
Node validateJSON.js \<schema file path\> ResourceMetaSchema.json \<schema folder path\>  
**Sample:**  
Node validateJSON.js ..\schemas\2015-08-01\Microsoft.Compute.json ResourceMetaSchema.json ..\schemas\
  2. [tools\runSchemaTests.js](tools/runSchemaTests.js)  
The script uses all test JSON files under [tests](tests/) folder to test against the schema files.  
**Usage:**   
Node runSchemaTests.js [--dir _folder_] [--AssertSubErrors]  
&nbsp;&nbsp;&nbsp;&nbsp;***To run tests in single folder:***  
&nbsp;&nbsp;&nbsp;&nbsp;Node runSchemaTests.js --dir ..\tests\2018-08-01  
&nbsp;&nbsp;&nbsp;&nbsp;***To run tests in single folder and assert subErrors:***  
&nbsp;&nbsp;&nbsp;&nbsp;Node runSchemaTests.js --dir ..\tests\2018-08-01 --AssertSubErrors  

---
This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.