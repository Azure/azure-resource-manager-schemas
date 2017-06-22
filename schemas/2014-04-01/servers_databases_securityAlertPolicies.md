# Microsoft.Sql/servers/databases/securityAlertPolicies template reference
API Version: 2014-04-01
## Template format

To create a Microsoft.Sql/servers/databases/securityAlertPolicies resource, add the following JSON to the resources section of your template.

```json
{
  "type": "Microsoft.Sql/servers/databases/securityAlertPolicies",
  "apiVersion": "2014-04-01",
  "location": "string",
  "properties": {
    "state": "string",
    "disabledAlerts": "string",
    "emailAddresses": "string",
    "emailAccountAdmins": "string",
    "storageEndpoint": "string",
    "storageAccountAccessKey": "string",
    "retentionDays": "integer",
    "useServerDefault": "string"
  }
}
```
## Property values

The following tables describe the values you need to set in the schema.

<a id="Microsoft.Sql/servers/databases/securityAlertPolicies" />
### Microsoft.Sql/servers/databases/securityAlertPolicies object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  type | enum | Yes | Microsoft.Sql/servers/databases/securityAlertPolicies |
|  apiVersion | enum | Yes | 2014-04-01 |
|  location | string | No | The geo-location where the resource lives |
|  properties | object | Yes | [DatabaseSecurityAlertPolicyProperties object](#DatabaseSecurityAlertPolicyProperties) |


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

