# Microsoft.Sql/servers/databases/backupLongTermRetentionPolicies template reference
API Version: 2014-04-01
## Template format

To create a Microsoft.Sql/servers/databases/backupLongTermRetentionPolicies resource, add the following JSON to the resources section of your template.

```json
{
  "name": "string",
  "type": "Microsoft.Sql/servers/databases/backupLongTermRetentionPolicies",
  "apiVersion": "2014-04-01",
  "properties": {
    "state": "string",
    "recoveryServicesBackupPolicyResourceId": "string"
  }
}
```
## Property values

The following tables describe the values you need to set in the schema.

<a id="Microsoft.Sql/servers/databases/backupLongTermRetentionPolicies" />
### Microsoft.Sql/servers/databases/backupLongTermRetentionPolicies object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  name | string | Yes |  |
|  type | enum | Yes | Microsoft.Sql/servers/databases/backupLongTermRetentionPolicies |
|  apiVersion | enum | Yes | 2014-04-01 |
|  properties | object | Yes | The properties of the backup long term retention policy - [BackupLongTermRetentionPolicyProperties object](#BackupLongTermRetentionPolicyProperties) |


<a id="BackupLongTermRetentionPolicyProperties" />
### BackupLongTermRetentionPolicyProperties object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  state | enum | Yes | The status of the backup long term retention policy. - Disabled or Enabled |
|  recoveryServicesBackupPolicyResourceId | string | Yes | The azure recovery services backup protection policy resource id |

