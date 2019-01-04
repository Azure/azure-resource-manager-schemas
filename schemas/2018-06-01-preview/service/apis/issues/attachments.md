# Microsoft.ApiManagement/service/apis/issues/attachments template reference
API Version: 2018-06-01-preview
## Template format

To create a Microsoft.ApiManagement/service/apis/issues/attachments resource, add the following JSON to the resources section of your template.

```json
{
  "name": "string",
  "type": "Microsoft.ApiManagement/service/apis/issues/attachments",
  "apiVersion": "2018-06-01-preview",
  "properties": {
    "title": "string",
    "contentFormat": "string",
    "content": "string"
  }
}
```
## Property values

The following tables describe the values you need to set in the schema.

<a id="Microsoft.ApiManagement/service/apis/issues/attachments" />
### Microsoft.ApiManagement/service/apis/issues/attachments object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  name | string | Yes | Attachment identifier within an Issue. Must be unique in the current Issue. |
|  type | enum | Yes | Microsoft.ApiManagement/service/apis/issues/attachments |
|  apiVersion | enum | Yes | 2018-06-01-preview |
|  properties | object | Yes | Properties of the Issue Attachment. - [IssueAttachmentContractProperties object](#IssueAttachmentContractProperties) |


<a id="IssueAttachmentContractProperties" />
### IssueAttachmentContractProperties object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  title | string | Yes | Filename by which the binary data will be saved. |
|  contentFormat | string | Yes | Either 'link' if content is provided via an HTTP link or the MIME type of the Base64-encoded binary data provided in the 'content' property. |
|  content | string | Yes | An HTTP link or Base64-encoded binary data. |

