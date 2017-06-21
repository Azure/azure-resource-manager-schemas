# Microsoft.Sql/servers/keys template reference
API Version: 2015-05-01-preview
## Template format

To create a Microsoft.Sql/servers/keys resource, add the following JSON to the resources section of your template.

```json
{
  "name": "string",
  "type": "Microsoft.Sql/servers/keys",
  "apiVersion": "2015-05-01-preview",
  "kind": "string",
  "properties": {
    "serverKeyType": "string",
    "uri": "string",
    "thumbprint": "string",
    "creationDate": "string"
  }
}
```
## Property values

The following tables describe the values you need to set in the schema.

<a id="Microsoft.Sql/servers/keys" />
### Microsoft.Sql/servers/keys object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  name | string | Yes |  |
|  type | enum | Yes | Microsoft.Sql/servers/keys |
|  apiVersion | enum | Yes | 2015-05-01-preview |
|  kind | string | No | Kind of encryption protector. This is metadata used for the Azure portal experience. |
|  properties | object | Yes | Resource properties. - [ServerKeyProperties object](#ServerKeyProperties) |


<a id="ServerKeyProperties" />
### ServerKeyProperties object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  serverKeyType | enum | No | The server key type like 'ServiceManaged', 'AzureKeyVault'. - ServiceManaged or AzureKeyVault |
|  uri | string | No | The URI of the server key. |
|  thumbprint | string | No | Thumbprint of the server key. |
|  creationDate | string | No | The server key creation date. |

