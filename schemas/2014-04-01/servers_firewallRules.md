# Microsoft.Sql/servers/firewallRules template reference
API Version: 2014-04-01
## Template format

To create a Microsoft.Sql/servers/firewallRules resource, add the following JSON to the resources section of your template.

```json
{
  "name": "string",
  "type": "Microsoft.Sql/servers/firewallRules",
  "apiVersion": "2014-04-01",
  "properties": {
    "startIpAddress": "string",
    "endIpAddress": "string"
  }
}
```
## Property values

The following tables describe the values you need to set in the schema.

<a id="Microsoft.Sql/servers/firewallRules" />
### Microsoft.Sql/servers/firewallRules object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  name | string | Yes |  |
|  type | enum | Yes | Microsoft.Sql/servers/firewallRules |
|  apiVersion | enum | Yes | 2014-04-01 |
|  properties | object | Yes | The properties representing the resource. - [FirewallRuleProperties object](#FirewallRuleProperties) |


<a id="FirewallRuleProperties" />
### FirewallRuleProperties object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  startIpAddress | string | Yes | The start IP address of the firewall rule. Must be IPv4 format. Use value '0.0.0.0' to represent all Azure-internal IP addresses. |
|  endIpAddress | string | Yes | The end IP address of the firewall rule. Must be IPv4 format. Must be greater than or equal to startIpAddress. Use value '0.0.0.0' to represent all Azure-internal IP addresses. |

