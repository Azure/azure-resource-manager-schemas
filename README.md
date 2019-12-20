# azure-resource-manager-schemas 

This is the repo for template deployment schemas hosted under `https://schema.management.azure.com/schemas`. Please see below for information on contributing and publishing updated schemas.

## Submitting a PR
* Ensure that any new resource types that you are adding have been added to the following top-level template schemas:
  * [schemas/2014-04-01-preview/deploymentTemplate.json](/schemas/2014-04-01-preview/deploymentTemplate.json)
  * [schemas/2015-01-01/deploymentTemplate.json](/schemas/2015-01-01/deploymentTemplate.json)
  * [schemas/2019-04-01/deploymentTemplate.json](/schemas/2019-04-01/deploymentTemplate.json)
* If your schema has been manually generated, please ensure you include appropriate tests in [tests](/tests/)
* If adding a new resource type, please add examples to the templates in [tools/templateTests](/tools/templateTests/)
* Ensure that the test suite passes (see [Tests](#tests))

## Tests
Use the following commands to execute the test suite locally:
* `cd tools`
* `npm install`
* `npm test`

## Autogenerating from swagger
You can use the generator in this repo to automatically generate a schema from a swagger spec checked into the [azure-rest-api-specs](https://github.com/Azure/azure-rest-api-specs) repo. We are working on fully automating this process, but please note that until then, it is your responsibility to ensure that the auto-generated schema has been correctly formatted before submitting a pull request.

See [Generator README](/generator/README.md) for more information.

### Instructions
1. Fork this repo, and clone it locally.
2. Run the following commands (replace the base path accordingly - valid paths can be disovered with `npm run list-basepaths`):
    * `cd generator`
    * `npm install`
    * `npm run generate-single myprovider/resource-manager`
4. Review the generator logs to ensure no errors, and review the changes generated.
5. Ensure that you have reviewed the guidelines under [Submitting a PR](#submitting-a-pr).
6. Generate a commit and push it to your fork.
7. Submit a pull request to this repo. Please include the full command output in a PR comment.

## Testing schemas locally
This repo contains a command to run a schema web server which will host files directly from your local repo. This can be useful if you want to validate schemas against a particular tool - for example if you want to verify VSCode autocompletion and syntax highlighting. By default this will listen on port 3000, but this can be modified by editing [tools/server.ts](/tools/server.ts).
To start an instance you can use the following commands:
* `cd tools`
* `npm install`
* `npm run serve`

Once this is running, you can create a basic template with the following structure (replacing the sections between `<` and `>` as appropriate for your scenario):
```json
{
  "$schema": "http://<hostname>:<port>/schemas/2019-04-01/deploymentTemplate.json",
  "resources": [
    {
      "type": "<providerNamespace>/<resourceType>",
      "apiVersion": "<apiVersion>",
      "properties": {
      }
    }
  ]
}
```
**NOTE** Many client tools will cache responses from schema servers, so you may need to clear this cache if you are testing modifications, or alternatively, change the port between retries.

---
This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
