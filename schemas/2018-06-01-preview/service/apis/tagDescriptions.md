# Microsoft.ApiManagement/service/apis/tagDescriptions template reference
API Version: 2018-06-01-preview
## Template format

To create a Microsoft.ApiManagement/service/apis/tagDescriptions resource, add the following JSON to the resources section of your template.

```json
{
  "name": "string",
  "type": "Microsoft.ApiManagement/service/apis/tagDescriptions",
  "apiVersion": "2018-06-01-preview",
  "properties": {
    "description": "string",
    "externalDocsUrl": "string",
    "externalDocsDescription": "string"
  }
}
```
## Property values

The following tables describe the values you need to set in the schema.

<a id="Microsoft.ApiManagement/service/apis/tagDescriptions" />
### Microsoft.ApiManagement/service/apis/tagDescriptions object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  name | string | Yes | Tag identifier. Must be unique in the current API Management service instance. |
|  type | enum | Yes | Microsoft.ApiManagement/service/apis/tagDescriptions |
|  apiVersion | enum | Yes | 2018-06-01-preview |
|  properties | object | Yes | Properties supplied to Create TagDescription operation. - [TagDescriptionBaseProperties object](#TagDescriptionBaseProperties) |


<a id="TagDescriptionBaseProperties" />
### TagDescriptionBaseProperties object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  description | string | No | Description of the Tag. |
|  externalDocsUrl | string | No | Absolute URL of external resources describing the tag. |
|  externalDocsDescription | string | No | Description of the external resources describing the tag. |

