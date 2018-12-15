# Microsoft.ApiManagement/service/apis/issues template reference
API Version: 2018-06-01-preview
## Template format

To create a Microsoft.ApiManagement/service/apis/issues resource, add the following JSON to the resources section of your template.

```json
{
  "name": "string",
  "type": "Microsoft.ApiManagement/service/apis/issues",
  "apiVersion": "2018-06-01-preview",
  "properties": {
    "createdDate": "string",
    "state": "string",
    "apiId": "string",
    "title": "string",
    "description": "string",
    "userId": "string"
  },
  "resources": []
}
```
## Property values

The following tables describe the values you need to set in the schema.

<a id="Microsoft.ApiManagement/service/apis/issues" />
### Microsoft.ApiManagement/service/apis/issues object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  name | string | Yes | Issue identifier. Must be unique in the current API Management service instance. |
|  type | enum | Yes | Microsoft.ApiManagement/service/apis/issues |
|  apiVersion | enum | Yes | 2018-06-01-preview |
|  properties | object | Yes | Properties of the Issue. - [IssueContractProperties object](#IssueContractProperties) |
|  resources | array | No | [attachments](./issues/attachments.md) [comments](./issues/comments.md) |


<a id="IssueContractProperties" />
### IssueContractProperties object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  createdDate | string | No | Date and time when the issue was created. |
|  state | enum | No | Status of the issue. - proposed, open, removed, resolved, closed |
|  apiId | string | No | A resource identifier for the API the issue was created for. |
|  title | string | Yes | The issue title. |
|  description | string | Yes | Text describing the issue. |
|  userId | string | Yes | A resource identifier for the user created the issue. |

