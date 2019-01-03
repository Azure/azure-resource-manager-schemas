# Microsoft.ApiManagement/service/apis/diagnostics template reference
API Version: 2018-06-01-preview
## Template format

To create a Microsoft.ApiManagement/service/apis/diagnostics resource, add the following JSON to the resources section of your template.

```json
{
  "name": "string",
  "type": "Microsoft.ApiManagement/service/apis/diagnostics",
  "apiVersion": "2018-06-01-preview",
  "properties": {
    "alwaysLog": "allErrors",
    "loggerId": "string",
    "sampling": {
      "samplingType": "fixed",
      "percentage": "number"
    },
    "frontend": {
      "request": {
        "headers": [
          "string"
        ],
        "body": {
          "bytes": "integer"
        }
      },
      "response": {
        "headers": [
          "string"
        ],
        "body": {
          "bytes": "integer"
        }
      }
    },
    "backend": {
      "request": {
        "headers": [
          "string"
        ],
        "body": {
          "bytes": "integer"
        }
      },
      "response": {
        "headers": [
          "string"
        ],
        "body": {
          "bytes": "integer"
        }
      }
    },
    "enableHttpCorrelationHeaders": "boolean"
  }
}
```
## Property values

The following tables describe the values you need to set in the schema.

<a id="Microsoft.ApiManagement/service/apis/diagnostics" />
### Microsoft.ApiManagement/service/apis/diagnostics object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  name | string | Yes | Diagnostic identifier. Must be unique in the current API Management service instance. |
|  type | enum | Yes | Microsoft.ApiManagement/service/apis/diagnostics |
|  apiVersion | enum | Yes | 2018-06-01-preview |
|  properties | object | Yes | Diagnostic entity contract properties. - [DiagnosticContractProperties object](#DiagnosticContractProperties) |


<a id="DiagnosticContractProperties" />
### DiagnosticContractProperties object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  alwaysLog | enum | No | Specifies for what type of messages sampling settings should not apply. - allErrors |
|  loggerId | string | Yes | Resource Id of a target logger. |
|  sampling | object | No | Sampling settings for Diagnostic. - [SamplingSettings object](#SamplingSettings) |
|  frontend | object | No | Diagnostic settings for incoming/outgoing HTTP messages to the Gateway. - [PipelineDiagnosticSettings object](#PipelineDiagnosticSettings) |
|  backend | object | No | Diagnostic settings for incoming/outgoing HTTP messages to the Backend - [PipelineDiagnosticSettings object](#PipelineDiagnosticSettings) |
|  enableHttpCorrelationHeaders | boolean | No | Whether to process Correlation Headers coming to Api Management Service. Only applicable to Application Insights diagnostics. Default is true. |


<a id="SamplingSettings" />
### SamplingSettings object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  samplingType | enum | No | Sampling type. - fixed |
|  percentage | number | No | Rate of sampling for fixed-rate sampling. |


<a id="PipelineDiagnosticSettings" />
### PipelineDiagnosticSettings object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  request | object | No | Diagnostic settings for request. - [HttpMessageDiagnostic object](#HttpMessageDiagnostic) |
|  response | object | No | Diagnostic settings for response. - [HttpMessageDiagnostic object](#HttpMessageDiagnostic) |


<a id="HttpMessageDiagnostic" />
### HttpMessageDiagnostic object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  headers | array | No | Array of HTTP Headers to log. - string |
|  body | object | No | Body logging settings. - [BodyDiagnosticSettings object](#BodyDiagnosticSettings) |


<a id="BodyDiagnosticSettings" />
### BodyDiagnosticSettings object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  bytes | integer | No | Number of request body bytes to log. |

