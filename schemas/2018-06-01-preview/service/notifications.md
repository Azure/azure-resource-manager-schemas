# Microsoft.ApiManagement/service/notifications template reference
API Version: 2018-06-01-preview
## Template format

To create a Microsoft.ApiManagement/service/notifications resource, add the following JSON to the resources section of your template.

```json
{
  "name": "string",
  "type": "Microsoft.ApiManagement/service/notifications",
  "apiVersion": "2018-06-01-preview",
  "resources": []
}
```
## Property values

The following tables describe the values you need to set in the schema.

<a id="Microsoft.ApiManagement/service/notifications" />
### Microsoft.ApiManagement/service/notifications object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  name | enum | Yes | Notification Name Identifier. - RequestPublisherNotificationMessage, PurchasePublisherNotificationMessage, NewApplicationNotificationMessage, BCC, NewIssuePublisherNotificationMessage, AccountClosedPublisher, QuotaLimitApproachingPublisherNotificationMessage |
|  type | enum | Yes | Microsoft.ApiManagement/service/notifications |
|  apiVersion | enum | Yes | 2018-06-01-preview |
|  resources | array | No | [recipientEmails](./notifications/recipientEmails.md) [recipientUsers](./notifications/recipientUsers.md) |

