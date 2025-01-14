# azure-resource-manager-schemas 

> [!WARNING]
> ## The schemas in this repository are designed for best-effort validation, and should NOT be relied upon for accuracy or programmatic consumption. If you have a current (or potential new) dependency that you would like to discuss alternatives for, please raise an issue.

This is the repo for template deployment schemas hosted under `https://schema.management.azure.com/schemas`. Please see below for information on contributing and publishing updated schemas.

## Updating Schemas
> [!NOTE]
> We only publish template schemas for resource providers that are **publicly available**. This means that there should be no restrictions (private preview, internal-only allowlisting) on who can call your APIs. As a general rule, if there is not an API definition in the [Public API Specs Repo](https://github.com/Azure/azure-rest-api-specs), we will not consider a PR.

Schemas are generated and updated automatically, and should not require any action from RP teams.

## Generating Locally
If you want to preview or troubleshoot generation locally, you can use the generator in this repo to generate a schema from a swagger spec checked into the [azure-rest-api-specs](https://github.com/Azure/azure-rest-api-specs) repo.

### Instructions
1. Clone [azure-rest-api-specs](https://github.com/Azure/azure-rest-api-specs).
1. Fork this repo, and clone it locally.
1. Update submodules and build dependencies:
    ```bash
    git submodule update --init --recursive
    npm --prefix bicep-types-az/bicep-types/src/bicep-types ci
    npm --prefix bicep-types-az/bicep-types/src/bicep-types run build
    npm --prefix bicep-types-az/src/autorest.bicep ci
    npm --prefix bicep-types-az/src/autorest.bicep run build
1. Run the following commands, replacing `../azure-rest-api-specs` with your relative path to the swagger repo, and `myprovider/resource-manager` with the base path (discovered with `npm --prefix generator run list-basepaths`)
    ```bash
    npm --prefix generator ci
    npm --prefix generator run generate-single -- --specs-dir ../azure-rest-api-specs --base-path myprovider/resource-manager
    ```

### Runing Unit Tests
Use the following commands to execute the test suite locally:
```bash
npm --prefix tools ci
npm --prefix tools test
```

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

## RP Schemas Repo Issues Bot Notifications
To get quickly notified on GitHub issues for your RP's schema, please update the [rp-label-to-contact.md](/rp-label-to-contact.md) by submitting a PR with the desired GitHub handle(s) and label for your RP.

---
This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
