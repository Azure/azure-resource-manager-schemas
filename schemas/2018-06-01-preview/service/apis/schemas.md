# Microsoft.ApiManagement/service/apis/schemas template reference
API Version: 2018-06-01-preview
## Template format

To create a Microsoft.ApiManagement/service/apis/schemas resource, add the following JSON to the resources section of your template.

```json
{
  "name": "string",
  "type": "Microsoft.ApiManagement/service/apis/schemas",
  "apiVersion": "2018-06-01-preview",
  "properties": {
    "contentType": "string",
    "document": {
      "value": "string"
    }
  }
}
```
## Property values

The following tables describe the values you need to set in the schema.

<a id="Microsoft.ApiManagement/service/apis/schemas" />
### Microsoft.ApiManagement/service/apis/schemas object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  name | string | Yes | Schema identifier within an API. Must be unique in the current API Management service instance. |
|  type | enum | Yes | Microsoft.ApiManagement/service/apis/schemas |
|  apiVersion | enum | Yes | 2018-06-01-preview |
|  properties | object | Yes | Properties of the Schema. - [SchemaContractProperties object](#SchemaContractProperties) |


<a id="SchemaContractProperties" />
### SchemaContractProperties object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  contentType | string | Yes | Must be a valid a media type used in a Content-Type header as defined in the RFC 2616. Media type of the schema document (e.g. application/json, application/xml). |
|  document | object | No | Properties of the Schema Document. - [SchemaDocumentProperties object](#SchemaDocumentProperties) |


<a id="SchemaDocumentProperties" />
### SchemaDocumentProperties object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  value | string | No | Json escaped string defining the document representing the Schema. |

