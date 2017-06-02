# Microsoft.Sql/servers/failoverGroups template reference
API Version: 2015-05-01-preview
## Template format

To create a Microsoft.Sql/servers/failoverGroups resource, add the following JSON to the resources section of your template.

```json
{
  "name": "string",
  "type": "Microsoft.Sql/servers/failoverGroups",
  "apiVersion": "2015-05-01-preview",
  "location": "string",
  "tags": {},
  "properties": {
    "readWriteEndpoint": {
      "failoverPolicy": "string",
      "failoverWithDataLossGracePeriodMinutes": "integer"
    },
    "readOnlyEndpoint": {
      "failoverPolicy": "string"
    },
    "partnerServers": [
      {
        "id": "string"
      }
    ],
    "databases": [
      "string"
    ]
  }
}
```
## Property values

The following tables describe the values you need to set in the schema.

<a id="Microsoft.Sql/servers/failoverGroups" />
### Microsoft.Sql/servers/failoverGroups object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  name | string | Yes | The name of the failover group. |
|  type | enum | Yes | Microsoft.Sql/servers/failoverGroups |
|  apiVersion | enum | Yes | 2015-05-01-preview |
|  location | string | No | The geo-location where the resource lives. |
|  tags | object | No | Resource tags. |
|  properties | object | Yes | The properties representing the resource. - [FailoverGroupProperties object](#FailoverGroupProperties) |


<a id="FailoverGroupProperties" />
### FailoverGroupProperties object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  readWriteEndpoint | object | No | Read-write endpoint of the failover group instance. - [FailoverGroupReadWriteEndpoint object](#FailoverGroupReadWriteEndpoint) |
|  readOnlyEndpoint | object | No | Read-only endpoint of the failover group instance. - [FailoverGroupReadOnlyEndpoint object](#FailoverGroupReadOnlyEndpoint) |
|  partnerServers | array | No | List of partner server information for the failover group. - [PartnerInfo object](#PartnerInfo) |
|  databases | array | No | List of databases in the failover group. - string |


<a id="FailoverGroupReadWriteEndpoint" />
### FailoverGroupReadWriteEndpoint object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  failoverPolicy | enum | No | Failover policy of the read-write endpoint for the failover group. - Manual or Automatic |
|  failoverWithDataLossGracePeriodMinutes | integer | No | Grace period before failover with data loss is attempted for the read-write endpoint. |


<a id="FailoverGroupReadOnlyEndpoint" />
### FailoverGroupReadOnlyEndpoint object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  failoverPolicy | enum | No | Failover policy of the read-only endpoint for the failover group. - Disabled or Enabled |


<a id="PartnerInfo" />
### PartnerInfo object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  id | string | No | Resource identifier of the partner server. |

