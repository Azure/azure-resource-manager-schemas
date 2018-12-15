# Microsoft.ApiManagement/service/templates template reference
API Version: 2018-06-01-preview
## Template format

To create a Microsoft.ApiManagement/service/templates resource, add the following JSON to the resources section of your template.

```json
{
  "name": "string",
  "type": "Microsoft.ApiManagement/service/templates",
  "apiVersion": "2018-06-01-preview",
  "properties": {
    "subject": "string",
    "title": "string",
    "description": "string",
    "body": "string",
    "parameters": [
      {
        "name": "string",
        "title": "string",
        "description": "string"
      }
    ]
  }
}
```
## Property values

The following tables describe the values you need to set in the schema.

<a id="Microsoft.ApiManagement/service/templates" />
### Microsoft.ApiManagement/service/templates object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  name | enum | Yes | Email Template Name Identifier. - applicationApprovedNotificationMessage, accountClosedDeveloper, quotaLimitApproachingDeveloperNotificationMessage, newDeveloperNotificationMessage, emailChangeIdentityDefault, inviteUserNotificationMessage, newCommentNotificationMessage, confirmSignUpIdentityDefault, newIssueNotificationMessage, purchaseDeveloperNotificationMessage, passwordResetIdentityDefault, passwordResetByAdminNotificationMessage, rejectDeveloperNotificationMessage, requestDeveloperNotificationMessage |
|  type | enum | Yes | Microsoft.ApiManagement/service/templates |
|  apiVersion | enum | Yes | 2018-06-01-preview |
|  properties | object | Yes | Email Template Update contract properties. - [EmailTemplateUpdateParameterProperties object](#EmailTemplateUpdateParameterProperties) |


<a id="EmailTemplateUpdateParameterProperties" />
### EmailTemplateUpdateParameterProperties object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  subject | string | No | Subject of the Template. |
|  title | string | No | Title of the Template. |
|  description | string | No | Description of the Email Template. |
|  body | string | No | Email Template Body. This should be a valid XDocument |
|  parameters | array | No | Email Template Parameter values. - [EmailTemplateParametersContractProperties object](#EmailTemplateParametersContractProperties) |


<a id="EmailTemplateParametersContractProperties" />
### EmailTemplateParametersContractProperties object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  name | string | No | Template parameter name. |
|  title | string | No | Template parameter title. |
|  description | string | No | Template parameter description. |

