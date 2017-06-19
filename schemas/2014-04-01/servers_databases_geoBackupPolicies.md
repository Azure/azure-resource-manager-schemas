# Microsoft.Sql/servers/databases/geoBackupPolicies template reference
API Version: 2014-04-01
## Template format

To create a Microsoft.Sql/servers/databases/geoBackupPolicies resource, add the following JSON to the resources section of your template.

```json
{
  "name": "Default",
  "type": "Microsoft.Sql/servers/databases/geoBackupPolicies",
  "apiVersion": "2014-04-01",
  "properties": {
    "state": "string"
  }
}
```
## Property values

The following tables describe the values you need to set in the schema.

<a id="Microsoft.Sql/servers/databases/geoBackupPolicies" />
### Microsoft.Sql/servers/databases/geoBackupPolicies object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  name | enum | Yes | The name of the geo backup policy. - Default |
|  type | enum | Yes | Microsoft.Sql/servers/databases/geoBackupPolicies |
|  apiVersion | enum | Yes | 2014-04-01 |
|  properties | object | Yes | The properties of the geo backup policy. - [GeoBackupPolicyProperties object](#GeoBackupPolicyProperties) |


<a id="GeoBackupPolicyProperties" />
### GeoBackupPolicyProperties object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  state | enum | Yes | The state of the geo backup policy. - Disabled or Enabled |

