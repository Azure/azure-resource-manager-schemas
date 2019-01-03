# Microsoft.ApiManagement/service/apis/issues/comments template reference
API Version: 2018-06-01-preview
## Template format

To create a Microsoft.ApiManagement/service/apis/issues/comments resource, add the following JSON to the resources section of your template.

```json
{
  "name": "string",
  "type": "Microsoft.ApiManagement/service/apis/issues/comments",
  "apiVersion": "2018-06-01-preview",
  "properties": {
    "text": "string",
    "createdDate": "string",
    "userId": "string"
  }
}
```
## Property values

The following tables describe the values you need to set in the schema.

<a id="Microsoft.ApiManagement/service/apis/issues/comments" />
### Microsoft.ApiManagement/service/apis/issues/comments object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  name | string | Yes | Comment identifier within an Issue. Must be unique in the current Issue. |
|  type | enum | Yes | Microsoft.ApiManagement/service/apis/issues/comments |
|  apiVersion | enum | Yes | 2018-06-01-preview |
|  properties | object | Yes | Properties of the Issue Comment. - [IssueCommentContractProperties object](#IssueCommentContractProperties) |


<a id="IssueCommentContractProperties" />
### IssueCommentContractProperties object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  text | string | Yes | Comment text. |
|  createdDate | string | No | Date and time when the comment was created. |
|  userId | string | Yes | A resource identifier for the user who left the comment. |

