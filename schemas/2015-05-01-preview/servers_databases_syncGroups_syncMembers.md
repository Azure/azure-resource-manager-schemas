# Microsoft.Sql/servers/databases/syncGroups/syncMembers template reference
API Version: 2015-05-01-preview
## Template format

To create a Microsoft.Sql/servers/databases/syncGroups/syncMembers resource, add the following JSON to the resources section of your template.

```json
{
  "name": "string",
  "type": "Microsoft.Sql/servers/databases/syncGroups/syncMembers",
  "apiVersion": "2015-05-01-preview",
  "properties": {
    "databaseType": "string",
    "syncAgentId": "string",
    "sqlServerDatabaseId": "string",
    "serverName": "string",
    "databaseName": "string",
    "userName": "string",
    "password": "string",
    "syncDirection": "string"
  }
}
```
## Property values

The following tables describe the values you need to set in the schema.

<a id="Microsoft.Sql/servers/databases/syncGroups/syncMembers" />
### Microsoft.Sql/servers/databases/syncGroups/syncMembers object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  name | string | Yes |  |
|  type | enum | Yes | Microsoft.Sql/servers/databases/syncGroups/syncMembers |
|  apiVersion | enum | Yes | 2015-05-01-preview |
|  properties | object | Yes | Resource properties. - [SyncMemberProperties object](#SyncMemberProperties) |


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

