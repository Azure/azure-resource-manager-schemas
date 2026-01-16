# Azure Resource Manager Schemas

> [!WARNING]
> ## The schemas in this repository are designed for best-effort validation, and should NOT be relied upon for accuracy or programmatic consumption. If you would like to take a dependency on Azure resource type metadat information, please see https://github.com/Azure/bicep-types-az instead.

This is the repo for template deployment schemas hosted under `https://schema.management.azure.com/schemas`. Please see below for information on contributing and publishing updated schemas.

## Updating Schemas
Schemas in this repo are fully generated from the type definitions in https://github.com/Azure/bicep-types-az. If you notice any issues, please raise them under https://github.com/Azure/bicep-types-az/issues. Please do not submit PRs to modify any of the files under [schemas](./schemas), as they will be overwritten by the generation process.

### Instructions
1. Fork this repo and clone it locally.
1. Ensure submodules are present (this repo consumes the generated type files from `bicep-types-az`):
  ```sh
  git submodule update --init --recursive
  ```
1. Regenerate all schemas into `schemas/`:
  ```sh
  ./scripts/run.sh
  ```

### Running Unit Tests
Use the following command to execute the test suite locally:
```sh
dotnet test
```

If you encounter baseline diffs in tests, update them with:
```sh
./scripts/update_baselines.sh
```

---
This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
