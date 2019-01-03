# Microsoft.ApiManagement/service/openidConnectProviders template reference
API Version: 2018-06-01-preview
## Template format

To create a Microsoft.ApiManagement/service/openidConnectProviders resource, add the following JSON to the resources section of your template.

```json
{
  "name": "string",
  "type": "Microsoft.ApiManagement/service/openidConnectProviders",
  "apiVersion": "2018-06-01-preview",
  "properties": {
    "displayName": "string",
    "description": "string",
    "metadataEndpoint": "string",
    "clientId": "string",
    "clientSecret": "string"
  }
}
```
## Property values

The following tables describe the values you need to set in the schema.

<a id="Microsoft.ApiManagement/service/openidConnectProviders" />
### Microsoft.ApiManagement/service/openidConnectProviders object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  name | string | Yes | Identifier of the OpenID Connect Provider. |
|  type | enum | Yes | Microsoft.ApiManagement/service/openidConnectProviders |
|  apiVersion | enum | Yes | 2018-06-01-preview |
|  properties | object | Yes | OpenId Connect Provider contract properties. - [OpenidConnectProviderContractProperties object](#OpenidConnectProviderContractProperties) |


<a id="OpenidConnectProviderContractProperties" />
### OpenidConnectProviderContractProperties object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  displayName | string | Yes | User-friendly OpenID Connect Provider name. |
|  description | string | No | User-friendly description of OpenID Connect Provider. |
|  metadataEndpoint | string | Yes | Metadata endpoint URI. |
|  clientId | string | Yes | Client ID of developer console which is the client application. |
|  clientSecret | string | No | Client Secret of developer console which is the client application. |

