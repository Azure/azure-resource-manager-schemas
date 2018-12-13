# Microsoft.ApiManagement/service/products/tags template reference
API Version: 2018-06-01-preview
## Template format

To create a Microsoft.ApiManagement/service/products/tags resource, add the following JSON to the resources section of your template.

```json
{
  "name": "string",
  "type": "Microsoft.ApiManagement/service/products/tags",
  "apiVersion": "2018-06-01-preview"
}
```
## Property values

The following tables describe the values you need to set in the schema.

<a id="Microsoft.ApiManagement/service/products/tags" />
### Microsoft.ApiManagement/service/products/tags object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  name | string | Yes | Tag identifier. Must be unique in the current API Management service instance. |
|  type | enum | Yes | Microsoft.ApiManagement/service/products/tags |
|  apiVersion | enum | Yes | 2018-06-01-preview |

