# Microsoft.Sql/servers/backupLongTermRetentionVaults template reference
API Version: 2014-04-01
## Template format

To create a Microsoft.Sql/servers/backupLongTermRetentionVaults resource, add the following JSON to the resources section of your template.

```json
{
  "name": "string",
  "type": "Microsoft.Sql/servers/backupLongTermRetentionVaults",
  "apiVersion": "2014-04-01",
  "properties": {
    "recoveryServicesVaultResourceId": "string"
  }
}
```
## Property values

The following tables describe the values you need to set in the schema.

<a id="Microsoft.Sql/servers/backupLongTermRetentionVaults" />
### Microsoft.Sql/servers/backupLongTermRetentionVaults object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  name | string | Yes |  |
|  type | enum | Yes | Microsoft.Sql/servers/backupLongTermRetentionVaults |
|  apiVersion | enum | Yes | 2014-04-01 |
|  properties | object | Yes | The properties of the backup long term retention vault - [BackupLongTermRetentionVaultProperties object](#BackupLongTermRetentionVaultProperties) |


<a id="BackupLongTermRetentionVaultProperties" />
### BackupLongTermRetentionVaultProperties object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  recoveryServicesVaultResourceId | string | No | The azure recovery services vault resource id |

