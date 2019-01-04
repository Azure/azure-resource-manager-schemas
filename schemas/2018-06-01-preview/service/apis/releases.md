# Microsoft.ApiManagement/service/apis/releases template reference
API Version: 2018-06-01-preview
## Template format

To create a Microsoft.ApiManagement/service/apis/releases resource, add the following JSON to the resources section of your template.

```json
{
  "name": "string",
  "type": "Microsoft.ApiManagement/service/apis/releases",
  "apiVersion": "2018-06-01-preview",
  "properties": {
    "apiId": "string",
    "notes": "string"
  }
}
```
## Property values

The following tables describe the values you need to set in the schema.

<a id="Microsoft.ApiManagement/service/apis/releases" />
### Microsoft.ApiManagement/service/apis/releases object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  name | string | Yes | Release identifier within an API. Must be unique in the current API Management service instance. |
|  type | enum | Yes | Microsoft.ApiManagement/service/apis/releases |
|  apiVersion | enum | Yes | 2018-06-01-preview |
|  properties | object | Yes | Properties of the Api Release Contract. - [ApiReleaseContractProperties object](#ApiReleaseContractProperties) |


<a id="ApiReleaseContractProperties" />
### ApiReleaseContractProperties object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  apiId | string | No | Identifier of the API the release belongs to. |
|  notes | string | No | Release Notes |

