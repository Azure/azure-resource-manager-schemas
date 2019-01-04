# Microsoft.ApiManagement/service/certificates template reference
API Version: 2018-06-01-preview
## Template format

To create a Microsoft.ApiManagement/service/certificates resource, add the following JSON to the resources section of your template.

```json
{
  "name": "string",
  "type": "Microsoft.ApiManagement/service/certificates",
  "apiVersion": "2018-06-01-preview",
  "properties": {
    "data": "string",
    "password": "string"
  }
}
```
## Property values

The following tables describe the values you need to set in the schema.

<a id="Microsoft.ApiManagement/service/certificates" />
### Microsoft.ApiManagement/service/certificates object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  name | string | Yes | Identifier of the certificate entity. Must be unique in the current API Management service instance. |
|  type | enum | Yes | Microsoft.ApiManagement/service/certificates |
|  apiVersion | enum | Yes | 2018-06-01-preview |
|  properties | object | Yes | Certificate create or update properties details. - [CertificateCreateOrUpdateProperties object](#CertificateCreateOrUpdateProperties) |


<a id="CertificateCreateOrUpdateProperties" />
### CertificateCreateOrUpdateProperties object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  data | string | Yes | Base 64 encoded certificate using the application/x-pkcs12 representation. |
|  password | string | Yes | Password for the Certificate |

