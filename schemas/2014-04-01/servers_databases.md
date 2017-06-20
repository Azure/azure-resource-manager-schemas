# Microsoft.Sql/servers/databases template reference
API Version: 2014-04-01
## Template format

To create a Microsoft.Sql/servers/databases resource, add the following JSON to the resources section of your template.

```json
{
  "name": "string",
  "type": "Microsoft.Sql/servers/databases",
  "apiVersion": "2014-04-01",
  "tags": {},
  "location": "string",
  "properties": {
    "collation": "string",
    "createMode": "string",
    "sourceDatabaseId": "string",
    "sourceDatabaseDeletionDate": "string",
    "restorePointInTime": "string",
    "recoveryServicesRecoveryPointResourceId": "string",
    "edition": "string",
    "maxSizeBytes": "string",
    "requestedServiceObjectiveId": "string",
    "requestedServiceObjectiveName": "string",
    "elasticPoolName": "string",
    "readScale": "string",
    "sampleName": "AdventureWorksLT"
  },
  "resources": [
    null
  ]
}
```
## Property values

The following tables describe the values you need to set in the schema.

<a id="Microsoft.Sql/servers/databases" />
### Microsoft.Sql/servers/databases object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  name | string | Yes |  |
|  type | enum | Yes | Microsoft.Sql/servers/databases |
|  apiVersion | enum | Yes | 2014-04-01 |
|  tags | object | No | Resource tags. |
|  location | string | Yes | Resource location. |
|  properties | object | Yes | The properties representing the resource. - [DatabaseProperties object](#DatabaseProperties) |
|  resources | array | No | [servers_databases_extensions_childResource object](#servers_databases_extensions_childResource) [servers_databases_geoBackupPolicies_childResource object](#servers_databases_geoBackupPolicies_childResource) [servers_databases_securityAlertPolicies_childResource object](#servers_databases_securityAlertPolicies_childResource) [servers_databases_backupLongTermRetentionPolicies_childResource object](#servers_databases_backupLongTermRetentionPolicies_childResource) |


<a id="DatabaseProperties" />
### DatabaseProperties object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  collation | string | No | The collation of the database. If createMode is not Default, this value is ignored. |
|  createMode | enum | No | Specifies the mode of database creation.

Default: regular database creation.

Copy: creates a database as a copy of an existing database. sourceDatabaseId must be specified as the resource ID of the source database.

OnlineSecondary/NonReadableSecondary: creates a database as a (readable or nonreadable) secondary replica of an existing database. sourceDatabaseId must be specified as the resource ID of the existing primary database.

PointInTimeRestore: Creates a database by restoring a point in time backup of an existing database. sourceDatabaseId must be specified as the resource ID of the existing database, and restorePointInTime must be specified.

Recovery: Creates a database by restoring a geo-replicated backup. sourceDatabaseId must be specified as the recoverable database resource ID to restore.

Restore: Creates a database by restoring a backup of a deleted database. sourceDatabaseId must be specified. If sourceDatabaseId is the database's original resource ID, then sourceDatabaseDeletionDate must be specified. Otherwise sourceDatabaseId must be the restorable dropped database resource ID and sourceDatabaseDeletionDate is ignored. restorePointInTime may also be specified to restore from an earlier point in time.

RestoreLongTermRetentionBackup: Creates a database by restoring from a long term retention vault. recoveryServicesRecoveryPointResourceId must be specified as the recovery point resource ID.

Copy, NonReadableSecondary, OnlineSecondary and RestoreLongTermRetentionBackup are not supported for DataWarehouse edition. - Copy, Default, NonReadableSecondary, OnlineSecondary, PointInTimeRestore, Recovery, Restore, RestoreLongTermRetentionBackup |
|  sourceDatabaseId | string | No | Conditional. If createMode is Copy, NonReadableSecondary, OnlineSecondary, PointInTimeRestore, Recovery, or Restore, then this value is required. Specifies the resource ID of the source database. If createMode is NonReadableSecondary or OnlineSecondary, the name of the source database must be the same as the new database being created. |
|  sourceDatabaseDeletionDate | string | No | Conditional. If createMode is Restore and sourceDatabaseId is the deleted database's original resource id when it existed (as opposed to its current restorable dropped database id), then this value is required. Specifies the time that the database was deleted. |
|  restorePointInTime | string | No | Conditional. If createMode is PointInTimeRestore, this value is required. If createMode is Restore, this value is optional. Specifies the point in time (ISO8601 format) of the source database that will be restored to create the new database. Must be greater than or equal to the source database's earliestRestoreDate value. |
|  recoveryServicesRecoveryPointResourceId | string | No | Conditional. If createMode is RestoreLongTermRetentionBackup, then this value is required. Specifies the resource ID of the recovery point to restore from. |
|  edition | enum | No | The edition of the database. The DatabaseEditions enumeration contains all the valid editions. If createMode is NonReadableSecondary or OnlineSecondary, this value is ignored. To see possible values, query the capabilities API (/subscriptions/{subscriptionId}/providers/Microsoft.Sql/locations/{locationID}/capabilities) referred to by operationId: "Capabilities_ListByLocation.". - Web, Business, Basic, Standard, Premium, Free, Stretch, DataWarehouse, System, System2 |
|  maxSizeBytes | string | No | The max size of the database expressed in bytes. If createMode is not Default, this value is ignored. To see possible values, query the capabilities API (/subscriptions/{subscriptionId}/providers/Microsoft.Sql/locations/{locationID}/capabilities) referred to by operationId: "Capabilities_ListByLocation." |
|  requestedServiceObjectiveId | string | No | The configured service level objective ID of the database. This is the service level objective that is in the process of being applied to the database. Once successfully updated, it will match the value of currentServiceObjectiveId property. If requestedServiceObjectiveId and requestedServiceObjectiveName are both updated, the value of requestedServiceObjectiveId overrides the value of requestedServiceObjectiveName. To see possible values, query the capabilities API (/subscriptions/{subscriptionId}/providers/Microsoft.Sql/locations/{locationID}/capabilities) referred to by operationId: "Capabilities_ListByLocation." - globally unique identifier |
|  requestedServiceObjectiveName | enum | No | The name of the configured service level objective of the database. This is the service level objective that is in the process of being applied to the database. Once successfully updated, it will match the value of serviceLevelObjective property. To see possible values, query the capabilities API (/subscriptions/{subscriptionId}/providers/Microsoft.Sql/locations/{locationID}/capabilities) referred to by operationId: "Capabilities_ListByLocation.". - Basic, S0, S1, S2, S3, P1, P2, P3, P4, P6, P11, P15, System, System2, ElasticPool |
|  elasticPoolName | string | No | The name of the elastic pool the database is in. If elasticPoolName and requestedServiceObjectiveName are both updated, the value of requestedServiceObjectiveName is ignored. Not supported for DataWarehouse edition. |
|  readScale | enum | No | Conditional. If the database is a geo-secondary, readScale indicates whether read-only connections are allowed to this database or not. Not supported for DataWarehouse edition. - Enabled or Disabled |
|  sampleName | enum | No | Indicates the name of the sample schema to apply when creating this database. If createMode is not Default, this value is ignored. Not supported for DataWarehouse edition. - AdventureWorksLT |


<a id="servers_databases_extensions_childResource" />
### servers_databases_extensions_childResource object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  name | string | Yes |  |
|  type | enum | Yes | extensions |
|  apiVersion | enum | Yes | 2014-04-01 |
|  properties | object | Yes | Represents the properties of the resource. - [ImportExtensionProperties object](#ImportExtensionProperties) |


<a id="servers_databases_geoBackupPolicies_childResource" />
### servers_databases_geoBackupPolicies_childResource object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  name | enum | Yes | The name of the geo backup policy. - Default |
|  type | enum | Yes | geoBackupPolicies |
|  apiVersion | enum | Yes | 2014-04-01 |
|  properties | object | Yes | The properties of the geo backup policy. - [GeoBackupPolicyProperties object](#GeoBackupPolicyProperties) |


<a id="servers_databases_securityAlertPolicies_childResource" />
### servers_databases_securityAlertPolicies_childResource object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  type | enum | Yes | securityAlertPolicies |
|  apiVersion | enum | Yes | 2014-04-01 |
|  location | string | No | The geo-location where the resource lives |
|  properties | object | Yes | [DatabaseSecurityAlertPolicyProperties object](#DatabaseSecurityAlertPolicyProperties) |


<a id="servers_databases_backupLongTermRetentionPolicies_childResource" />
### servers_databases_backupLongTermRetentionPolicies_childResource object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  name | string | Yes |  |
|  type | enum | Yes | backupLongTermRetentionPolicies |
|  apiVersion | enum | Yes | 2014-04-01 |
|  properties | object | Yes | The properties of the backup long term retention policy - [BackupLongTermRetentionPolicyProperties object](#BackupLongTermRetentionPolicyProperties) |


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


<a id="GeoBackupPolicyProperties" />
### GeoBackupPolicyProperties object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  state | enum | Yes | The state of the geo backup policy. - Disabled or Enabled |


<a id="DatabaseSecurityAlertPolicyProperties" />
### DatabaseSecurityAlertPolicyProperties object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  state | enum | Yes | Specifies the state of the policy. If state is Enabled, storageEndpoint and storageAccountAccessKey are required. - New, Enabled, Disabled |
|  disabledAlerts | string | No | Specifies the semicolon-separated list of alerts that are disabled, or empty string to disable no alerts. Possible values: Sql_Injection; Sql_Injection_Vulnerability; Access_Anomaly; Usage_Anomaly. |
|  emailAddresses | string | No | Specifies the semicolon-separated list of e-mail addresses to which the alert is sent. |
|  emailAccountAdmins | enum | No | Specifies that the alert is sent to the account administrators. - Enabled or Disabled |
|  storageEndpoint | string | No | Specifies the blob storage endpoint (e.g. https://MyAccount.blob.core.windows.net). This blob storage will hold all Threat Detection audit logs. If state is Enabled, storageEndpoint is required. |
|  storageAccountAccessKey | string | No | Specifies the identifier key of the Threat Detection audit storage account. If state is Enabled, storageAccountAccessKey is required. |
|  retentionDays | integer | No | Specifies the number of days to keep in the Threat Detection audit logs. |
|  useServerDefault | enum | No | Specifies whether to use the default server policy. - Enabled or Disabled |


<a id="BackupLongTermRetentionPolicyProperties" />
### BackupLongTermRetentionPolicyProperties object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  state | enum | Yes | The status of the backup long term retention policy. - Disabled or Enabled |
|  recoveryServicesBackupPolicyResourceId | string | Yes | The azure recovery services backup protection policy resource id |

