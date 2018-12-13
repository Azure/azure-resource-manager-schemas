# Microsoft.ApiManagement/service/properties template reference
API Version: 2018-06-01-preview
## Template format

To create a Microsoft.ApiManagement/service/properties resource, add the following JSON to the resources section of your template.

```json
{
  "name": "string",
  "type": "Microsoft.ApiManagement/service/properties",
  "apiVersion": "2018-06-01-preview",
  "properties": {
    "tags": [
      "string"
    ],
    "secret": "boolean",
    "displayName": "string",
    "value": "string"
  }
}
```
## Property values

The following tables describe the values you need to set in the schema.

<a id="Microsoft.ApiManagement/service/properties" />
### Microsoft.ApiManagement/service/properties object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  name | string | Yes | Identifier of the property. |
|  type | enum | Yes | Microsoft.ApiManagement/service/properties |
|  apiVersion | enum | Yes | 2018-06-01-preview |
|  properties | object | Yes | Property entity contract properties. - [PropertyContractProperties object](#PropertyContractProperties) |


<a id="PropertyContractProperties" />
### PropertyContractProperties object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  tags | array | No | Optional tags that when provided can be used to filter the property list. - string |
|  secret | boolean | No | Determines whether the value is a secret and should be encrypted or not. Default value is false. |
|  displayName | string | Yes | Unique name of Property. It may contain only letters, digits, period, dash, and underscore characters. |
|  value | string | Yes | Value of the property. Can contain policy expressions. It may not be empty or consist only of whitespace. |

