# Microsoft.Sql/servers/communicationLinks template reference
API Version: 2014-04-01
## Template format

To create a Microsoft.Sql/servers/communicationLinks resource, add the following JSON to the resources section of your template.

```json
{
  "name": "string",
  "type": "Microsoft.Sql/servers/communicationLinks",
  "apiVersion": "2014-04-01",
  "properties": {
    "partnerServer": "string"
  }
}
```
## Property values

The following tables describe the values you need to set in the schema.

<a id="Microsoft.Sql/servers/communicationLinks" />
### Microsoft.Sql/servers/communicationLinks object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  name | string | Yes |  |
|  type | enum | Yes | Microsoft.Sql/servers/communicationLinks |
|  apiVersion | enum | Yes | 2014-04-01 |
|  properties | object | Yes | The properties of resource. - [ServerCommunicationLinkProperties object](#ServerCommunicationLinkProperties) |


<a id="ServerCommunicationLinkProperties" />
### ServerCommunicationLinkProperties object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  partnerServer | string | Yes | The name of the partner server. |

