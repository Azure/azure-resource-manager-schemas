# Microsoft.Sql/servers template reference
API Version: 2014-04-01
## Template format

To create a Microsoft.Sql/servers resource, add the following JSON to the resources section of your template.

```json
{
  "name": "string",
  "type": "Microsoft.Sql/servers",
  "apiVersion": "2014-04-01",
  "tags": {},
  "location": "string",
  "properties": {
    "version": "string",
    "administratorLogin": "string",
    "administratorLoginPassword": "string"
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
|  apiVersion | enum | Yes | 2014-04-01 |
|  tags | object | No | Resource tags. |
|  location | string | Yes | Resource location. |
|  properties | object | Yes | Represents the properties of the resource. - [ServerProperties object](#ServerProperties) |


<a id="ServerProperties" />
### ServerProperties object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  version | enum | No | The version of the server. - 2.0 or 12.0 |
|  administratorLogin | string | No | Administrator username for the server. Can only be specified when the server is being created (and is required for creation). |
|  administratorLoginPassword | string | No | The administrator login password (required for server creation). |

