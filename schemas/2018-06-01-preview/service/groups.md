# Microsoft.ApiManagement/service/groups template reference
API Version: 2018-06-01-preview
## Template format

To create a Microsoft.ApiManagement/service/groups resource, add the following JSON to the resources section of your template.

```json
{
  "name": "string",
  "type": "Microsoft.ApiManagement/service/groups",
  "apiVersion": "2018-06-01-preview",
  "properties": {
    "displayName": "string",
    "description": "string",
    "type": "string",
    "externalId": "string"
  },
  "resources": []
}
```
## Property values

The following tables describe the values you need to set in the schema.

<a id="Microsoft.ApiManagement/service/groups" />
### Microsoft.ApiManagement/service/groups object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  name | string | Yes | Group identifier. Must be unique in the current API Management service instance. |
|  type | enum | Yes | Microsoft.ApiManagement/service/groups |
|  apiVersion | enum | Yes | 2018-06-01-preview |
|  properties | object | Yes | Properties supplied to Create Group operation. - [GroupCreateParametersProperties object](#GroupCreateParametersProperties) |
|  resources | array | No | [users](./groups/users.md) |


<a id="GroupCreateParametersProperties" />
### GroupCreateParametersProperties object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  displayName | string | Yes | Group name. |
|  description | string | No | Group description. |
|  type | enum | No | Group type. - custom, system, external |
|  externalId | string | No | Identifier of the external groups, this property contains the id of the group from the external identity provider, e.g. for Azure Active Directory `aad://<tenant>.onmicrosoft.com/groups/<group object id>`; otherwise the value is null. |

