# Microsoft.Sql/servers/databases/extensions template reference
API Version: 2014-04-01
## Template format

To create a Microsoft.Sql/servers/databases/extensions resource, add the following JSON to the resources section of your template.

```json
{
  "name": "string",
  "type": "Microsoft.Sql/servers/databases/extensions",
  "apiVersion": "2014-04-01",
  "properties": {
    "storageKeyType": "string",
    "storageKey": "string",
    "storageUri": "string",
    "administratorLogin": "string",
    "administratorLoginPassword": "string",
    "authenticationType": "string",
    "operationMode": "Import"
  }
}
```
## Property values

The following tables describe the values you need to set in the schema.

<a id="Microsoft.Sql/servers/databases/extensions" />
### Microsoft.Sql/servers/databases/extensions object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  name | string | Yes |  |
|  type | enum | Yes | Microsoft.Sql/servers/databases/extensions |
|  apiVersion | enum | Yes | 2014-04-01 |
|  properties | object | Yes | Represents the properties of the resource. - [ImportExtensionProperties object](#ImportExtensionProperties) |


<a id="ImportExtensionProperties" />
### ImportExtensionProperties object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  storageKeyType | enum | Yes | The type of the storage key to use. - StorageAccessKey or SharedAccessKey |
|  storageKey | string | Yes | The storage key to use.  If storage key type is SharedAccessKey, it must be preceded with a "?." |
|  storageUri | string | Yes | The storage uri to use. |
|  administratorLogin | string | Yes | The name of the SQL administrator. |
|  administratorLoginPassword | string | Yes | The password of the SQL administrator. |
|  authenticationType | enum | No | The authentication type. - SQL or ADPassword |
|  operationMode | enum | Yes | The type of import operation being performed. This is always Import. - Import |

