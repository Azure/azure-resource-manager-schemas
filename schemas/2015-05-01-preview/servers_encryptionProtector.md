# Microsoft.Sql/servers/encryptionProtector template reference
API Version: 2015-05-01-preview
## Template format

To create a Microsoft.Sql/servers/encryptionProtector resource, add the following JSON to the resources section of your template.

```json
{
  "name": "string",
  "type": "Microsoft.Sql/servers/encryptionProtector",
  "apiVersion": "2015-05-01-preview",
  "kind": "string",
  "properties": {
    "serverKeyName": "string",
    "serverKeyType": "string"
  }
}
```
## Property values

The following tables describe the values you need to set in the schema.

<a id="Microsoft.Sql/servers/encryptionProtector" />
### Microsoft.Sql/servers/encryptionProtector object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  name | string | Yes |  |
|  type | enum | Yes | Microsoft.Sql/servers/encryptionProtector |
|  apiVersion | enum | Yes | 2015-05-01-preview |
|  kind | string | No | Kind of encryption protector. This is metadata used for the Azure portal experience. |
|  properties | object | Yes | Resource properties. - [EncryptionProtectorProperties object](#EncryptionProtectorProperties) |


<a id="EncryptionProtectorProperties" />
### EncryptionProtectorProperties object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  serverKeyName | string | No | The name of the server key. |
|  serverKeyType | enum | No | The encryption protector type like 'ServiceManaged', 'AzureKeyVault'. - ServiceManaged or AzureKeyVault |

