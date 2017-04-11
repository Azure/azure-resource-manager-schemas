# Microsoft.Sql/servers template reference
API Version: 2014-04-01-preview
## Template format

To create a Microsoft.Sql/servers resource, add the following JSON to the resources section of your template.

```json
{
  "name": "string",
  "type": "Microsoft.Sql/servers",
  "apiVersion": "2014-04-01-preview",
  "tags": {},
  "location": "string",
  "properties": {
    "version": "string",
    "administratorLogin": "string",
    "administratorLoginPassword": "string"
  },
  "resources": [
    null
  ]
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
|  apiVersion | enum | Yes | 2014-04-01-preview |
|  tags | object | No | Resource tags. |
|  location | string | Yes | Resource location. |
|  properties | object | Yes | Represents the properties of the resource. - [ServerProperties object](#ServerProperties) |
|  resources | array | No | [servers_elasticPools_childResource object](#servers_elasticPools_childResource) [servers_databases_childResource object](#servers_databases_childResource) [servers_firewallRules_childResource object](#servers_firewallRules_childResource) |


<a id="ServerProperties" />
### ServerProperties object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  version | enum | No | The version of the server. - 2.0 or 12.0 |
|  administratorLogin | string | No | Administrator username for the server. Can only be specified when the server is being created (and is required for creation). |
|  administratorLoginPassword | string | No | The administrator login password (required for server creation). |


<a id="servers_elasticPools_childResource" />
### servers_elasticPools_childResource object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  name | string | Yes |  |
|  type | enum | Yes | elasticPools |
|  apiVersion | enum | Yes | 2014-04-01-preview |
|  tags | object | No | Resource tags. |
|  location | string | Yes | Resource location. |
|  properties | object | Yes | The properties representing the resource. - [ElasticPoolProperties object](#ElasticPoolProperties) |


<a id="servers_databases_childResource" />
### servers_databases_childResource object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  name | string | Yes |  |
|  type | enum | Yes | databases |
|  apiVersion | enum | Yes | 2014-04-01-preview |
|  tags | object | No | Resource tags. |
|  location | string | Yes | Resource location. |
|  properties | object | Yes | The properties representing the resource. - [DatabaseProperties object](#DatabaseProperties) |


<a id="servers_firewallRules_childResource" />
### servers_firewallRules_childResource object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  name | string | Yes |  |
|  type | enum | Yes | firewallRules |
|  apiVersion | enum | Yes | 2014-04-01-preview |
|  properties | object | Yes | The properties representing the resource. - [FirewallRuleProperties object](#FirewallRuleProperties) |


<a id="ElasticPoolProperties" />
### ElasticPoolProperties object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  edition | enum | No | The edition of the elastic pool. - Basic, Standard, Premium |
|  dtu | integer | No | The total shared DTU for the database elastic pool. |
|  databaseDtuMax | integer | No | The maximum DTU any one database can consume. |
|  databaseDtuMin | integer | No | The minimum DTU all databases are guaranteed. |
|  storageMB | integer | No | Gets storage limit for the database elastic pool in MB. |


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


<a id="FirewallRuleProperties" />
### FirewallRuleProperties object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  startIpAddress | string | Yes | The start IP address of the firewall rule. Must be IPv4 format. Use value '0.0.0.0' to represent all Azure-internal IP addresses. |
|  endIpAddress | string | Yes | The end IP address of the firewall rule. Must be IPv4 format. Must be greater than or equal to startIpAddress. Use value '0.0.0.0' to represent all Azure-internal IP addresses. |

