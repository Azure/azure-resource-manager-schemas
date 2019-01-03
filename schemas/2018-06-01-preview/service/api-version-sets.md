# Microsoft.ApiManagement/service/api-version-sets template reference
API Version: 2018-06-01-preview
## Template format

To create a Microsoft.ApiManagement/service/api-version-sets resource, add the following JSON to the resources section of your template.

```json
{
  "name": "string",
  "type": "Microsoft.ApiManagement/service/api-version-sets",
  "apiVersion": "2018-06-01-preview",
  "properties": {
    "description": "string",
    "versionQueryName": "string",
    "versionHeaderName": "string",
    "displayName": "string",
    "versioningScheme": "string"
  }
}
```
## Property values

The following tables describe the values you need to set in the schema.

<a id="Microsoft.ApiManagement/service/api-version-sets" />
### Microsoft.ApiManagement/service/api-version-sets object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  name | string | Yes | Api Version Set identifier. Must be unique in the current API Management service instance. |
|  type | enum | Yes | Microsoft.ApiManagement/service/api-version-sets |
|  apiVersion | enum | Yes | 2018-06-01-preview |
|  properties | object | Yes | Api VersionSet contract properties. - [ApiVersionSetContractProperties object](#ApiVersionSetContractProperties) |


<a id="ApiVersionSetContractProperties" />
### ApiVersionSetContractProperties object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  description | string | No | Description of API Version Set. |
|  versionQueryName | string | No | Name of query parameter that indicates the API Version if versioningScheme is set to `query`. |
|  versionHeaderName | string | No | Name of HTTP header parameter that indicates the API Version if versioningScheme is set to `header`. |
|  displayName | string | Yes | Name of API Version Set |
|  versioningScheme | enum | Yes | An value that determines where the API Version identifer will be located in a HTTP request. - Segment, Query, Header |

