# Microsoft.Sql/servers/virtualNetworkRules template reference
API Version: 2015-05-01-preview
## Template format

To create a Microsoft.Sql/servers/virtualNetworkRules resource, add the following JSON to the resources section of your template.

```json
{
  "name": "string",
  "type": "Microsoft.Sql/servers/virtualNetworkRules",
  "apiVersion": "2015-05-01-preview",
  "properties": {
    "virtualNetworkSubnetId": "string"
  }
}
```
## Property values

The following tables describe the values you need to set in the schema.

<a id="Microsoft.Sql/servers/virtualNetworkRules" />
### Microsoft.Sql/servers/virtualNetworkRules object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  name | string | Yes |  |
|  type | enum | Yes | Microsoft.Sql/servers/virtualNetworkRules |
|  apiVersion | enum | Yes | 2015-05-01-preview |
|  properties | object | Yes | Resource properties. - [VirtualNetworkRuleProperties object](#VirtualNetworkRuleProperties) |


<a id="VirtualNetworkRuleProperties" />
### VirtualNetworkRuleProperties object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  virtualNetworkSubnetId | string | No | The resource ID of the virtual network subnet |

