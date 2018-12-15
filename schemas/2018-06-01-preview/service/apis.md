# Microsoft.ApiManagement/service/apis template reference
API Version: 2018-06-01-preview
## Template format

To create a Microsoft.ApiManagement/service/apis resource, add the following JSON to the resources section of your template.

```json
{
  "name": "string",
  "type": "Microsoft.ApiManagement/service/apis",
  "apiVersion": "2018-06-01-preview",
  "properties": {
    "description": "string",
    "authenticationSettings": {
      "oAuth2": {
        "authorizationServerId": "string",
        "scope": "string"
      },
      "openid": {
        "openidProviderId": "string",
        "bearerTokenSendingMethods": [
          "string"
        ]
      },
      "subscriptionKeyRequired": "boolean"
    },
    "subscriptionKeyParameterNames": {
      "header": "string",
      "query": "string"
    },
    "type": "string",
    "apiRevision": "string",
    "apiVersion": "string",
    "apiRevisionDescription": "string",
    "apiVersionDescription": "string",
    "apiVersionSetId": "string",
    "subscriptionRequired": "boolean",
    "displayName": "string",
    "serviceUrl": "string",
    "path": "string",
    "protocols": [
      "string"
    ],
    "apiVersionSet": {
      "id": "string",
      "description": "string",
      "versioningScheme": "string",
      "versionQueryName": "string",
      "versionHeaderName": "string"
    },
    "contentValue": "string",
    "contentFormat": "string",
    "wsdlSelector": {
      "wsdlServiceName": "string",
      "wsdlEndpointName": "string"
    },
    "apiType": "string"
  },
  "resources": []
}
```
## Property values

The following tables describe the values you need to set in the schema.

<a id="Microsoft.ApiManagement/service/apis" />
### Microsoft.ApiManagement/service/apis object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  name | string | Yes | API identifier. Must be unique in the current API Management service instance. |
|  type | enum | Yes | Microsoft.ApiManagement/service/apis |
|  apiVersion | enum | Yes | 2018-06-01-preview |
|  properties | object | Yes | Api entity create of update properties. - [ApiCreateOrUpdateProperties object](#ApiCreateOrUpdateProperties) |
|  resources | array | No | [tagDescriptions](./apis/tagDescriptions.md) [tags](./apis/tags.md) [issues](./apis/issues.md) [diagnostics](./apis/diagnostics.md) [schemas](./apis/schemas.md) [policies](./apis/policies.md) [operations](./apis/operations.md) [releases](./apis/releases.md) |


<a id="ApiCreateOrUpdateProperties" />
### ApiCreateOrUpdateProperties object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  description | string | No | Description of the API. May include HTML formatting tags. |
|  authenticationSettings | object | No | Collection of authentication settings included into this API. - [AuthenticationSettingsContract object](#AuthenticationSettingsContract) |
|  subscriptionKeyParameterNames | object | No | Protocols over which API is made available. - [SubscriptionKeyParameterNamesContract object](#SubscriptionKeyParameterNamesContract) |
|  type | enum | No | Type of API. - http or soap |
|  apiRevision | string | No | Describes the Revision of the Api. If no value is provided, default revision 1 is created |
|  apiVersion | string | No | Indicates the Version identifier of the API if the API is versioned |
|  apiRevisionDescription | string | No | Description of the Api Revision. |
|  apiVersionDescription | string | No | Description of the Api Version. |
|  apiVersionSetId | string | No | A resource identifier for the related ApiVersionSet. |
|  subscriptionRequired | boolean | No | Specifies whether an API or Product subscription is required for accessing the API. |
|  displayName | string | No | API name. |
|  serviceUrl | string | No | Absolute URL of the backend service implementing this API. |
|  path | string | Yes | Relative URL uniquely identifying this API and all of its resource paths within the API Management service instance. It is appended to the API endpoint base URL specified during the service instance creation to form a public URL for this API. |
|  protocols | array | No | Describes on which protocols the operations in this API can be invoked. - http or https |
|  apiVersionSet | object | No | [ApiVersionSetContractDetails object](#ApiVersionSetContractDetails) |
|  contentValue | string | No | Content value when Importing an API. |
|  contentFormat | enum | No | Format of the Content in which the API is getting imported. - wadl-xml, wadl-link-json, swagger-json, swagger-link-json, wsdl, wsdl-link |
|  wsdlSelector | object | No | Criteria to limit import of WSDL to a subset of the document. - [ApiCreateOrUpdatePropertiesWsdlSelector object](#ApiCreateOrUpdatePropertiesWsdlSelector) |
|  apiType | enum | No | Type of Api to create.  * `http` creates a SOAP to REST API  * `soap` creates a SOAP pass-through API. - http or soap |


<a id="AuthenticationSettingsContract" />
### AuthenticationSettingsContract object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  oAuth2 | object | No | OAuth2 Authentication settings - [OAuth2AuthenticationSettingsContract object](#OAuth2AuthenticationSettingsContract) |
|  openid | object | No | OpenID Connect Authentication Settings - [OpenIdAuthenticationSettingsContract object](#OpenIdAuthenticationSettingsContract) |
|  subscriptionKeyRequired | boolean | No | Specifies whether subscription key is required during call to this API, true - API is included into closed products only, false - API is included into open products alone, null - there is a mix of products. |


<a id="SubscriptionKeyParameterNamesContract" />
### SubscriptionKeyParameterNamesContract object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  header | string | No | Subscription key header name. |
|  query | string | No | Subscription key query string parameter name. |


<a id="ApiVersionSetContractDetails" />
### ApiVersionSetContractDetails object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  id | string | No | Identifier for existing API Version Set. Omit this value to create a new Version Set. |
|  description | string | No | Description of API Version Set. |
|  versioningScheme | enum | No | An value that determines where the API Version identifer will be located in a HTTP request. - Segment, Query, Header |
|  versionQueryName | string | No | Name of query parameter that indicates the API Version if versioningScheme is set to `query`. |
|  versionHeaderName | string | No | Name of HTTP header parameter that indicates the API Version if versioningScheme is set to `header`. |


<a id="ApiCreateOrUpdatePropertiesWsdlSelector" />
### ApiCreateOrUpdatePropertiesWsdlSelector object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  wsdlServiceName | string | No | Name of service to import from WSDL |
|  wsdlEndpointName | string | No | Name of endpoint(port) to import from WSDL |


<a id="OAuth2AuthenticationSettingsContract" />
### OAuth2AuthenticationSettingsContract object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  authorizationServerId | string | No | OAuth authorization server identifier. |
|  scope | string | No | operations scope. |


<a id="OpenIdAuthenticationSettingsContract" />
### OpenIdAuthenticationSettingsContract object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  openidProviderId | string | No | OAuth authorization server identifier. |
|  bearerTokenSendingMethods | array | No | How to send token to the server. - authorizationHeader or query |

