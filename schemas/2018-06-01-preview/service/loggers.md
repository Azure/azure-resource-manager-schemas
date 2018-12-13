# Microsoft.ApiManagement/service/loggers template reference
API Version: 2018-06-01-preview
## Template format

To create a Microsoft.ApiManagement/service/loggers resource, add the following JSON to the resources section of your template.

```json
{
  "name": "string",
  "type": "Microsoft.ApiManagement/service/loggers",
  "apiVersion": "2018-06-01-preview",
  "properties": {
    "loggerType": "string",
    "description": "string",
    "credentials": {},
    "isBuffered": "boolean",
    "resourceId": "string"
  }
}
```
## Property values

The following tables describe the values you need to set in the schema.

<a id="Microsoft.ApiManagement/service/loggers" />
### Microsoft.ApiManagement/service/loggers object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  name | string | Yes | Logger identifier. Must be unique in the API Management service instance. |
|  type | enum | Yes | Microsoft.ApiManagement/service/loggers |
|  apiVersion | enum | Yes | 2018-06-01-preview |
|  properties | object | Yes | Logger entity contract properties. - [LoggerContractProperties object](#LoggerContractProperties) |


<a id="LoggerContractProperties" />
### LoggerContractProperties object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  loggerType | enum | Yes | Logger type. - azureEventHub or applicationInsights |
|  description | string | No | Logger description. |
|  credentials | object | Yes | The name and SendRule connection string of the event hub for azureEventHub logger.Instrumentation key for applicationInsights logger. |
|  isBuffered | boolean | No | Whether records are buffered in the logger before publishing. Default is assumed to be true. |
|  resourceId | string | No | Azure Resource Id of a log target (either Azure Event Hub resource or Azure Application Insights resource). |

