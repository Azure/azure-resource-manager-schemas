# Microsoft.Sql/servers/databases/auditingSettings template reference
API Version: 2015-05-01-preview
## Template format

To create a Microsoft.Sql/servers/databases/auditingSettings resource, add the following JSON to the resources section of your template.

```json
{
  "name": "string",
  "type": "Microsoft.Sql/servers/databases/auditingSettings",
  "apiVersion": "2015-05-01-preview",
  "properties": {
    "state": "string",
    "storageEndpoint": "string",
    "storageAccountAccessKey": "string",
    "retentionDays": "integer",
    "auditActionsAndGroups": [
      "string"
    ],
    "storageAccountSubscriptionId": "string",
    "isStorageSecondaryKeyInUse": boolean
  }
}
```
## Property values

The following tables describe the values you need to set in the schema.

<a id="Microsoft.Sql/servers/databases/auditingSettings" />
### Microsoft.Sql/servers/databases/auditingSettings object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  name | string | Yes |  |
|  type | enum | Yes | Microsoft.Sql/servers/databases/auditingSettings |
|  apiVersion | enum | Yes | 2015-05-01-preview |
|  properties | object | Yes | Resource properties. - [DatabaseBlobAuditingPolicyProperties object](#DatabaseBlobAuditingPolicyProperties) |


<a id="DatabaseBlobAuditingPolicyProperties" />
### DatabaseBlobAuditingPolicyProperties object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  state | enum | No | Specifies the state of the policy. If state is Enabled, storageEndpoint and storageAccountAccessKey are required. - Enabled or Disabled |
|  storageEndpoint | string | No | Specifies the blob storage endpoint (e.g. https://MyAccount.blob.core.windows.net). If state is Enabled, storageEndpoint is required. |
|  storageAccountAccessKey | string | No | Specifies the identifier key of the auditing storage account. If state is Enabled, storageAccountAccessKey is required. |
|  retentionDays | integer | No | Specifies the number of days to keep in the audit logs. |
|  auditActionsAndGroups | array | No | Specifies the Actions and Actions-Groups to audit. - string |
|  storageAccountSubscriptionId | string | No | Specifies the blob storage subscription Id. - globally unique identifier |
|  isStorageSecondaryKeyInUse | boolean | No | Specifies whether storageAccountAccessKey value is the storage’s secondary key. |

