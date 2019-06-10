# azure-resource-manager-schemas 

This is the repo for template deployment schemas hosted at https://schema.management.azure.com/.

Welcome to contribute to template deployment schemas, please send pull request to improve the schemas. We will review the pull request and publish the latest schemas to https://schema.management.azure.com/schemas

## Hints
* When you add a new resource type in schema, please add it into [schemas\2014-04-01-preview\deploymentTemplate.json](schemas/2014-04-01-preview/deploymentTemplate.json), [schemas\2015-01-01\deploymentTemplate.json](schemas/2015-01-01/deploymentTemplate.json) and [schemas\2019-04-01\deploymentTemplate.json](schemas/2019-04-01/deploymentTemplate.json).
* Please add or update [tests](tests/) and run the full test suite before submitting your change (see [Running the full suite](#running-the-full-suite))

## Tests
### Running the full suite
Use the following to run all of the schema tests:
* `cd tools`
* `npm install`
* `npm test`

### Validating schema against schema metaformat
You can use [validateJSON.js](tools/validateJSON.js) against [ResourceMetaSchema.json](tools/ResourceMetaSchema.json) to do some basic checks against the new/updated schema file.
#### Usage
`node validateJSON.js <schema file path> ResourceMetaSchema.json <schema folder path>`
#### Sample
`node validateJSON.js ..\schemas\2015-08-01\Microsoft.Compute.json ResourceMetaSchema.json ..\schemas\`

### Running individual schema tests
You can use [runSchemaTests.js](tools/runSchemaTests.js) to test all the JSON files in [tests](tests/) against the schemas.
#### Usage
`node runSchemaTests.js [--dir _folder_] [--AssertSubErrors]`
#### Samples
##### Run tests in single folder
`node runSchemaTests.js --dir ..\tests\2018-08-01`
##### Run tests in single folder and assert subErrors
`node runSchemaTests.js --dir ..\tests\2018-08-01 --AssertSubErrors`

## Autogenerating from swagger
You can use the generator in this repo to automatically generate a schema from a swagger spec checked into the [azure-rest-api-specs](https://github.com/Azure/azure-rest-api-specs) repo. We are working on fully automating this process, but please note that until then, it is your responsibility to ensure that the auto-generated schema has been correctly formatted before submitting a pull request.
### Instructions
1. Fork this repo, and clone it locally.
2. Run the following commands (replace the provider namespace and api version accordingly):
    * `cd generator`
    * `npm install`
    * `npm run generate-single -- -ProviderNamespace Microsoft.MyProvider -ApiVersion 2019-04-01`
4. Review the generator logs to ensure no errors, and review the changes generated.
5. Generate a commit and push it to your fork.
6. Submit a pull request to this repo.

---
This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.