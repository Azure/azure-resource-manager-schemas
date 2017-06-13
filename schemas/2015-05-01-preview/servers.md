# Microsoft.Sql/servers template reference
API Version: 2015-05-01-preview
## Template format

To create a Microsoft.Sql/servers resource, add the following JSON to the resources section of your template.

```json
{
  "name": "string",
  "type": "Microsoft.Sql/servers",
  "apiVersion": "2015-05-01-preview",
  "location": "string",
  "tags": {},
  "identity": {
    "type": "SystemAssigned"
  },
  "properties": {
    "administratorLogin": "string",
    "administratorLoginPassword": "string",
    "version": "string"
  }
}
```
## Property values

The following tables describe the values you need to set in the schema.

<a id="Microsoft.Sql/servers" />
### Microsoft.Sql/servers object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  name | string | Yes | The name of the server. |
|  type | enum | Yes | Microsoft.Sql/servers |
|  apiVersion | enum | Yes | 2015-05-01-preview |
|  location | string | No | Resource location. |
|  tags | object | No | Resource tags. |
|  identity | object | No | The Azure Active Directory identity of the server. - [ResourceIdentity object](#ResourceIdentity) |
|  properties | object | Yes | Resource properties. - [ServerProperties object](#ServerProperties) |


<a id="ResourceIdentity" />
### ResourceIdentity object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  type | enum | No | The identity type. Set this to 'SystemAssigned' in order to automatically create and assign an Azure Active Directory principal for the resource. - SystemAssigned |


<a id="ServerProperties" />
### ServerProperties object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  administratorLogin | string | No | Administrator username for the server. Once created it cannot be changed. |
|  administratorLoginPassword | string | No | The administrator login password (required for server creation). |
|  version | string | No | The version of the server. |

