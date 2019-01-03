# Microsoft.ApiManagement/service/backends template reference
API Version: 2018-06-01-preview
## Template format

To create a Microsoft.ApiManagement/service/backends resource, add the following JSON to the resources section of your template.

```json
{
  "name": "string",
  "type": "Microsoft.ApiManagement/service/backends",
  "apiVersion": "2018-06-01-preview",
  "properties": {
    "title": "string",
    "description": "string",
    "resourceId": "string",
    "properties": {
      "serviceFabricCluster": {
        "clientCertificatethumbprint": "string",
        "maxPartitionResolutionRetries": "integer",
        "managementEndpoints": [
          "string"
        ],
        "serverCertificateThumbprints": [
          "string"
        ],
        "serverX509Names": [
          {
            "name": "string",
            "issuerCertificateThumbprint": "string"
          }
        ]
      }
    },
    "credentials": {
      "certificate": [
        "string"
      ],
      "query": {},
      "header": {},
      "authorization": {
        "scheme": "string",
        "parameter": "string"
      }
    },
    "proxy": {
      "url": "string",
      "username": "string",
      "password": "string"
    },
    "tls": {
      "validateCertificateChain": "boolean",
      "validateCertificateName": "boolean"
    },
    "url": "string",
    "protocol": "string"
  }
}
```
## Property values

The following tables describe the values you need to set in the schema.

<a id="Microsoft.ApiManagement/service/backends" />
### Microsoft.ApiManagement/service/backends object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  name | string | Yes | Identifier of the Backend entity. Must be unique in the current API Management service instance. |
|  type | enum | Yes | Microsoft.ApiManagement/service/backends |
|  apiVersion | enum | Yes | 2018-06-01-preview |
|  properties | object | Yes | Backend entity contract properties. - [BackendContractProperties object](#BackendContractProperties) |


<a id="BackendContractProperties" />
### BackendContractProperties object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  title | string | No | Backend Title. |
|  description | string | No | Backend Description. |
|  resourceId | string | No | Management Uri of the Resource in External System. This url can be the Arm Resource Id of Logic Apps, Function Apps or Api Apps. |
|  properties | object | No | Backend Properties contract - [BackendProperties object](#BackendProperties) |
|  credentials | object | No | Backend Credentials Contract Properties - [BackendCredentialsContract object](#BackendCredentialsContract) |
|  proxy | object | No | Backend Proxy Contract Properties - [BackendProxyContract object](#BackendProxyContract) |
|  tls | object | No | Backend TLS Properties - [BackendTlsProperties object](#BackendTlsProperties) |
|  url | string | Yes | Runtime Url of the Backend. |
|  protocol | enum | Yes | Backend communication protocol. - http or soap |


<a id="BackendProperties" />
### BackendProperties object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  serviceFabricCluster | object | No | Backend Service Fabric Cluster Properties - [BackendServiceFabricClusterProperties object](#BackendServiceFabricClusterProperties) |


<a id="BackendCredentialsContract" />
### BackendCredentialsContract object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  certificate | array | No | List of Client Certificate Thumbprint. - string |
|  query | object | No | Query Parameter description. |
|  header | object | No | Header Parameter description. |
|  authorization | object | No | Authorization header authentication - [BackendAuthorizationHeaderCredentials object](#BackendAuthorizationHeaderCredentials) |


<a id="BackendProxyContract" />
### BackendProxyContract object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  url | string | Yes | WebProxy Server AbsoluteUri property which includes the entire URI stored in the Uri instance, including all fragments and query strings. |
|  username | string | No | Username to connect to the WebProxy server |
|  password | string | No | Password to connect to the WebProxy Server |


<a id="BackendTlsProperties" />
### BackendTlsProperties object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  validateCertificateChain | boolean | No | Flag indicating whether SSL certificate chain validation should be done when using self-signed certificates for this backend host. |
|  validateCertificateName | boolean | No | Flag indicating whether SSL certificate name validation should be done when using self-signed certificates for this backend host. |


<a id="BackendServiceFabricClusterProperties" />
### BackendServiceFabricClusterProperties object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  clientCertificatethumbprint | string | Yes | The client certificate thumbprint for the management endpoint. |
|  maxPartitionResolutionRetries | integer | No | Maximum number of retries while attempting resolve the partition. |
|  managementEndpoints | array | Yes | The cluster management endpoint. - string |
|  serverCertificateThumbprints | array | No | Thumbprints of certificates cluster management service uses for tls communication - string |
|  serverX509Names | array | No | Server X509 Certificate Names Collection - [X509CertificateName object](#X509CertificateName) |


<a id="BackendAuthorizationHeaderCredentials" />
### BackendAuthorizationHeaderCredentials object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  scheme | string | Yes | Authentication Scheme name. |
|  parameter | string | Yes | Authentication Parameter value. |


<a id="X509CertificateName" />
### X509CertificateName object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  name | string | No | Common Name of the Certificate. |
|  issuerCertificateThumbprint | string | No | Thumbprint for the Issuer of the Certificate. |

