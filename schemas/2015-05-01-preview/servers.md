# Microsoft.Sql/servers template reference
API Version: 2015-05-01-preview
## Template format

To create a Microsoft.Sql/servers resource, add the following JSON to the resources section of your template.

```json
{
  "name": "string",
  "type": "Microsoft.Sql/servers",
  "apiVersion": "2015-05-01-preview",
  "location": "string",
  "tags": {},
  "identity": {
    "type": "SystemAssigned"
  },
  "properties": {
    "administratorLogin": "string",
    "administratorLoginPassword": "string",
    "version": "string"
  },
  "resources": [
    null
  ]
}
```
## Property values

The following tables describe the values you need to set in the schema.

<a id="Microsoft.Sql/servers" />
### Microsoft.Sql/servers object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  name | string | Yes | The name of the server. |
|  type | enum | Yes | Microsoft.Sql/servers |
|  apiVersion | enum | Yes | 2015-05-01-preview |
|  location | string | No | Resource location. |
|  tags | object | No | Resource tags. |
|  identity | object | No | The Azure Active Directory identity of the server. - [ResourceIdentity object](#ResourceIdentity) |
|  properties | object | Yes | Resource properties. - [ServerProperties object](#ServerProperties) |
|  resources | array | No | [servers_virtualNetworkRules_childResource object](#servers_virtualNetworkRules_childResource) [servers_syncAgents_childResource object](#servers_syncAgents_childResource) [servers_keys_childResource object](#servers_keys_childResource) [servers_failoverGroups_childResource object](#servers_failoverGroups_childResource) [servers_encryptionProtector_childResource object](#servers_encryptionProtector_childResource) |


<a id="ResourceIdentity" />
### ResourceIdentity object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  type | enum | No | The identity type. Set this to 'SystemAssigned' in order to automatically create and assign an Azure Active Directory principal for the resource. - SystemAssigned |


<a id="ServerProperties" />
### ServerProperties object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  administratorLogin | string | No | Administrator username for the server. Once created it cannot be changed. |
|  administratorLoginPassword | string | No | The administrator login password (required for server creation). |
|  version | string | No | The version of the server. |


<a id="servers_virtualNetworkRules_childResource" />
### servers_virtualNetworkRules_childResource object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  name | string | Yes |  |
|  type | enum | Yes | virtualNetworkRules |
|  apiVersion | enum | Yes | 2015-05-01-preview |
|  properties | object | Yes | Resource properties. - [VirtualNetworkRuleProperties object](#VirtualNetworkRuleProperties) |


<a id="servers_syncAgents_childResource" />
### servers_syncAgents_childResource object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  name | string | Yes |  |
|  type | enum | Yes | syncAgents |
|  apiVersion | enum | Yes | 2015-05-01-preview |
|  properties | object | Yes | Resource properties. - [SyncAgentProperties object](#SyncAgentProperties) |


<a id="servers_keys_childResource" />
### servers_keys_childResource object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  name | string | Yes |  |
|  type | enum | Yes | keys |
|  apiVersion | enum | Yes | 2015-05-01-preview |
|  kind | string | No | Kind of encryption protector. This is metadata used for the Azure portal experience. |
|  properties | object | Yes | Resource properties. - [ServerKeyProperties object](#ServerKeyProperties) |


<a id="servers_failoverGroups_childResource" />
### servers_failoverGroups_childResource object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  name | string | Yes |  |
|  type | enum | Yes | failoverGroups |
|  apiVersion | enum | Yes | 2015-05-01-preview |
|  tags | object | No | Resource tags. |
|  properties | object | Yes | Resource properties. - [FailoverGroupProperties object](#FailoverGroupProperties) |


<a id="servers_encryptionProtector_childResource" />
### servers_encryptionProtector_childResource object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  name | string | Yes |  |
|  type | enum | Yes | encryptionProtector |
|  apiVersion | enum | Yes | 2015-05-01-preview |
|  kind | string | No | Kind of encryption protector. This is metadata used for the Azure portal experience. |
|  properties | object | Yes | Resource properties. - [EncryptionProtectorProperties object](#EncryptionProtectorProperties) |


<a id="VirtualNetworkRuleProperties" />
### VirtualNetworkRuleProperties object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  virtualNetworkSubnetId | string | No | The resource ID of the virtual network subnet |


<a id="SyncAgentProperties" />
### SyncAgentProperties object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  syncDatabaseId | string | No | ARM resource id of the sync database in the sync agent. |


<a id="ServerKeyProperties" />
### ServerKeyProperties object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  serverKeyType | enum | No | The server key type like 'ServiceManaged', 'AzureKeyVault'. - ServiceManaged or AzureKeyVault |
|  uri | string | No | The URI of the server key. |
|  thumbprint | string | No | Thumbprint of the server key. |
|  creationDate | string | No | The server key creation date. |


<a id="FailoverGroupProperties" />
### FailoverGroupProperties object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  readWriteEndpoint | object | No | Read-write endpoint of the failover group instance. - [FailoverGroupReadWriteEndpoint object](#FailoverGroupReadWriteEndpoint) |
|  readOnlyEndpoint | object | No | Read-only endpoint of the failover group instance. - [FailoverGroupReadOnlyEndpoint object](#FailoverGroupReadOnlyEndpoint) |
|  partnerServers | array | No | List of partner server information for the failover group. - [PartnerInfo object](#PartnerInfo) |
|  databases | array | No | List of databases in the failover group. - string |


<a id="EncryptionProtectorProperties" />
### EncryptionProtectorProperties object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  serverKeyName | string | No | The name of the server key. |
|  serverKeyType | enum | No | The encryption protector type like 'ServiceManaged', 'AzureKeyVault'. - ServiceManaged or AzureKeyVault |


<a id="FailoverGroupReadWriteEndpoint" />
### FailoverGroupReadWriteEndpoint object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  failoverPolicy | enum | No | Failover policy of the read-write endpoint for the failover group. - Manual or Automatic |
|  failoverWithDataLossGracePeriodMinutes | integer | No | Grace period before failover with data loss is attempted for the read-write endpoint. |


<a id="FailoverGroupReadOnlyEndpoint" />
### FailoverGroupReadOnlyEndpoint object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  failoverPolicy | enum | No | Failover policy of the read-only endpoint for the failover group. - Disabled or Enabled |


<a id="PartnerInfo" />
### PartnerInfo object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  id | string | No | Resource identifier of the partner server. |

