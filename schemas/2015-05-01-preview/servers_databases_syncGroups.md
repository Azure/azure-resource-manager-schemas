# Microsoft.Sql/servers/databases/syncGroups template reference
API Version: 2015-05-01-preview
## Template format

To create a Microsoft.Sql/servers/databases/syncGroups resource, add the following JSON to the resources section of your template.

```json
{
  "name": "string",
  "type": "Microsoft.Sql/servers/databases/syncGroups",
  "apiVersion": "2015-05-01-preview",
  "properties": {
    "interval": "integer",
    "conflictResolutionPolicy": "string",
    "syncDatabaseId": "string",
    "hubDatabaseUserName": "string",
    "hubDatabasePassword": "string",
    "schema": {
      "tables": [
        {
          "columns": [
            {
              "quotedName": "string",
              "dataSize": "string",
              "dataType": "string"
            }
          ],
          "quotedName": "string"
        }
      ],
      "masterSyncMemberName": "string"
    }
  },
  "resources": [
    null
  ]
}
```
## Property values

The following tables describe the values you need to set in the schema.

<a id="Microsoft.Sql/servers/databases/syncGroups" />
### Microsoft.Sql/servers/databases/syncGroups object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  name | string | Yes |  |
|  type | enum | Yes | Microsoft.Sql/servers/databases/syncGroups |
|  apiVersion | enum | Yes | 2015-05-01-preview |
|  properties | object | Yes | Resource properties. - [SyncGroupProperties object](#SyncGroupProperties) |
|  resources | array | No | [servers_databases_syncGroups_syncMembers_childResource object](#servers_databases_syncGroups_syncMembers_childResource) |


<a id="SyncGroupProperties" />
### SyncGroupProperties object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  interval | integer | No | Sync interval of the sync group. |
|  conflictResolutionPolicy | enum | No | Conflict resolution policy of the sync group. - HubWin or MemberWin |
|  syncDatabaseId | string | No | ARM resource id of the sync database in the sync group. |
|  hubDatabaseUserName | string | No | User name for the sync group hub database credential. |
|  hubDatabasePassword | string | No | Password for the sync group hub database credential. |
|  schema | object | No | Sync schema of the sync group. - [SyncGroupSchema object](#SyncGroupSchema) |


<a id="servers_databases_syncGroups_syncMembers_childResource" />
### servers_databases_syncGroups_syncMembers_childResource object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  name | string | Yes |  |
|  type | enum | Yes | syncMembers |
|  apiVersion | enum | Yes | 2015-05-01-preview |
|  properties | object | Yes | Resource properties. - [SyncMemberProperties object](#SyncMemberProperties) |


<a id="SyncGroupSchema" />
### SyncGroupSchema object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  tables | array | No | List of tables in sync group schema. - [SyncGroupSchemaTable object](#SyncGroupSchemaTable) |
|  masterSyncMemberName | string | No | Name of master sync member where the schema is from. |


<a id="SyncMemberProperties" />
### SyncMemberProperties object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  databaseType | enum | No | Database type of the sync member. - AzureSqlDatabase or SqlServerDatabase |
|  syncAgentId | string | No | ARM resource id of the sync agent in the sync member. |
|  sqlServerDatabaseId | string | No | SQL Server database id of the sync member. - globally unique identifier |
|  serverName | string | No | Server name of the member database in the sync member |
|  databaseName | string | No | Database name of the member database in the sync member. |
|  userName | string | No | User name of the member database in the sync member. |
|  password | string | No | Password of the member database in the sync member. |
|  syncDirection | enum | No | Sync direction of the sync member. - Bidirectional, OneWayMemberToHub, OneWayHubToMember |


<a id="SyncGroupSchemaTable" />
### SyncGroupSchemaTable object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  columns | array | No | List of columns in sync group schema. - [SyncGroupSchemaTableColumn object](#SyncGroupSchemaTableColumn) |
|  quotedName | string | No | Quoted name of sync group schema table. |


<a id="SyncGroupSchemaTableColumn" />
### SyncGroupSchemaTableColumn object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  quotedName | string | No | Quoted name of sync group table column. |
|  dataSize | string | No | Data size of the column. |
|  dataType | string | No | Data type of the column. |

