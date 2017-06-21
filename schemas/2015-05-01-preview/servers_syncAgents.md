# Microsoft.Sql/servers/syncAgents template reference
API Version: 2015-05-01-preview
## Template format

To create a Microsoft.Sql/servers/syncAgents resource, add the following JSON to the resources section of your template.

```json
{
  "name": "string",
  "type": "Microsoft.Sql/servers/syncAgents",
  "apiVersion": "2015-05-01-preview",
  "properties": {
    "syncDatabaseId": "string"
  }
}
```
## Property values

The following tables describe the values you need to set in the schema.

<a id="Microsoft.Sql/servers/syncAgents" />
### Microsoft.Sql/servers/syncAgents object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  name | string | Yes |  |
|  type | enum | Yes | Microsoft.Sql/servers/syncAgents |
|  apiVersion | enum | Yes | 2015-05-01-preview |
|  properties | object | Yes | Resource properties. - [SyncAgentProperties object](#SyncAgentProperties) |


<a id="SyncAgentProperties" />
### SyncAgentProperties object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  syncDatabaseId | string | No | ARM resource id of the sync database in the sync agent. |

