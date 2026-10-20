# azure-resource-manager-schemas 

> [!WARNING]
> ## The schemas in this repository are designed for best-effort validation, and should NOT be relied upon for accuracy or programmatic consumption. If you have a current (or potential new) dependency that you would like to discuss alternatives for, please raise an issue.

This is the repo for template deployment schemas hosted under `https://schema.management.azure.com/schemas`. Please see below for information on contributing and publishing updated schemas.

## Updating Schemas
> [!NOTE]
> We only publish template schemas for resource providers that are **publicly available**. This means that there should be no restrictions (private preview, internal-only allowlisting) on who can call your APIs. As a general rule, if there is not an API definition in the [Public API Specs Repo](https://github.com/Azure/azure-rest-api-specs), we will not consider a PR.

Schemas are generated and updated automatically, and should not require any action from RP teams.

## Generating Locally
Schema generation uses only the C# generator in `src/TemplateSchemaGenerator`, reading pre-built Bicep types from the pinned `bicep-types-az/generated` submodule. It does not regenerate types from Swagger specs. To use newer API definitions, update the submodule to a commit containing the corresponding generated Bicep types.

### Instructions
1. Fork this repo, and clone it locally.
1. Install the .NET SDK specified by `global.json` and Node.js, then initialize submodules and publish the generator:
    ```bash
    git submodule update --init --recursive
    dotnet publish src/TemplateSchemaGenerator
    ```
1. Install the orchestration dependencies and generate a provider:
    ```bash
    npm --prefix generator ci
    npm --prefix generator run generate -- --provider-namespace Microsoft.Compute
    ```

Run `npm --prefix generator run generate` without `--provider-namespace` to generate all providers in the Bicep types index in one run and update their root-schema references directly. Existing schemas and references for other providers are preserved. Both modes write a Markdown summary to `summary.log` by default; use `--summary-log-path` to choose another location.

Generation supports all providers or a single `--provider-namespace`; Swagger paths and readmes are not supported as generation inputs. Providers missing from the Bicep types index fail explicitly. The retired Swagger-to-SDK automation integration and its package-result output are no longer supported.

The C# generator preserves Compute's VM and VM scale-set extension overrides, including nested extensions and inline scale-set extension profiles. It embeds the curated definitions in [Microsoft.Compute.Extensions.json](generator/processors/Microsoft.Compute.Extensions.json); generated extension resources and their root-schema references use the companion `Microsoft.Compute.Extensions.json` schema for each API version.

Validate the TypeScript generator with `npm --prefix generator run lint` and `npm --prefix generator run build`, and run C# generator tests with `dotnet test`.

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

---
This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
