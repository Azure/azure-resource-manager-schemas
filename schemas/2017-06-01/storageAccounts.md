# Microsoft.Storage/storageAccounts template reference
API Version: 2017-06-01
## Template format

To create a Microsoft.Storage/storageAccounts resource, add the following JSON to the resources section of your template.

```json
{
  "name": "string",
  "type": "Microsoft.Storage/storageAccounts",
  "apiVersion": "2017-06-01",
  "sku": {
    "name": "string",
    "restrictions": [
      {
        "reasonCode": "string"
      }
    ]
  },
  "kind": "string",
  "location": "string",
  "tags": {},
  "identity": {
    "type": "SystemAssigned"
  },
  "properties": {
    "customDomain": {
      "name": "string",
      "useSubDomain": boolean
    },
    "encryption": {
      "services": {
        "blob": {
          "enabled": boolean
        },
        "file": {
          "enabled": boolean
        }
      },
      "keySource": "string",
      "keyvaultproperties": {
        "keyname": "string",
        "keyversion": "string",
        "keyvaulturi": "string"
      }
    },
    "networkAcls": {
      "bypass": "string",
      "virtualNetworkRules": [
        {
          "id": "string",
          "action": "Allow",
          "state": "string"
        }
      ],
      "ipRules": [
        {
          "value": "string",
          "action": "Allow"
        }
      ],
      "defaultAction": "string"
    },
    "accessTier": "string",
    "supportsHttpsTrafficOnly": "false"
  }
}
```
## Property values

The following tables describe the values you need to set in the schema.

<a id="Microsoft.Storage/storageAccounts" />
### Microsoft.Storage/storageAccounts object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  name | string | Yes |  |
|  type | enum | Yes | Microsoft.Storage/storageAccounts |
|  apiVersion | enum | Yes | 2017-06-01 |
|  sku | object | Yes | Required. Gets or sets the sku name. - [Sku object](#Sku) |
|  kind | enum | Yes | Required. Indicates the type of storage account. - Storage or BlobStorage |
|  location | string | Yes | Required. Gets or sets the location of the resource. This will be one of the supported and registered Azure Geo Regions (e.g. West US, East US, Southeast Asia, etc.). The geo region of a resource cannot be changed once it is created, but if an identical geo region is specified on update, the request will succeed. |
|  tags | object | No | Gets or sets a list of key value pairs that describe the resource. These tags can be used for viewing and grouping this resource (across resource groups). A maximum of 15 tags can be provided for a resource. Each tag must have a key with a length no greater than 128 characters and a value with a length no greater than 256 characters. |
|  identity | object | No | The identity of the resource. - [Identity object](#Identity) |
|  properties | object | Yes | The parameters used to create the storage account. - [StorageAccountPropertiesCreateParameters object](#StorageAccountPropertiesCreateParameters) |


<a id="Sku" />
### Sku object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  name | enum | Yes | Gets or sets the sku name. Required for account creation; optional for update. Note that in older versions, sku name was called accountType. - Standard_LRS, Standard_GRS, Standard_RAGRS, Standard_ZRS, Premium_LRS |
|  restrictions | array | No | The restrictions because of which SKU cannot be used. This is empty if there are no restrictions. - [Restriction object](#Restriction) |


<a id="Identity" />
### Identity object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  type | enum | Yes | The identity type. - SystemAssigned |


<a id="StorageAccountPropertiesCreateParameters" />
### StorageAccountPropertiesCreateParameters object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  customDomain | object | No | User domain assigned to the storage account. Name is the CNAME source. Only one custom domain is supported per storage account at this time. To clear the existing custom domain, use an empty string for the custom domain name property. - [CustomDomain object](#CustomDomain) |
|  encryption | object | No | Provides the encryption settings on the account. If left unspecified the account encryption settings will remain the same. The default setting is unencrypted. - [Encryption object](#Encryption) |
|  networkAcls | object | No | Network rule set - [NetworkRuleSet object](#NetworkRuleSet) |
|  accessTier | enum | No | Required for storage accounts where kind = BlobStorage. The access tier used for billing. - Hot or Cool |
|  supportsHttpsTrafficOnly | enum | No | Allows https traffic only to storage service if sets to true. - false |


<a id="Restriction" />
### Restriction object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  reasonCode | enum | No | The reason for the restriction. As of now this can be “QuotaId” or “NotAvailableForSubscription”. Quota Id is set when the SKU has requiredQuotas parameter as the subscription does not belong to that quota. The “NotAvailableForSubscription” is related to capacity at DC. - QuotaId or NotAvailableForSubscription |


<a id="CustomDomain" />
### CustomDomain object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  name | string | Yes | Gets or sets the custom domain name assigned to the storage account. Name is the CNAME source. |
|  useSubDomain | boolean | No | Indicates whether indirect CName validation is enabled. Default value is false. This should only be set on updates. |


<a id="Encryption" />
### Encryption object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  services | object | No | List of services which support encryption. - [EncryptionServices object](#EncryptionServices) |
|  keySource | enum | Yes | The encryption keySource (provider). Possible values (case-insensitive):  Microsoft.Storage, Microsoft.Keyvault. - Microsoft.Storage or Microsoft.Keyvault |
|  keyvaultproperties | object | No | Properties provided by key vault. - [KeyVaultProperties object](#KeyVaultProperties) |


<a id="NetworkRuleSet" />
### NetworkRuleSet object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  bypass | enum | No | Specifies whether traffic is bypassed for Logging/Metrics/AzureServices. Possible values are any combination of Logging|Metrics|AzureServices (For example, "Logging, Metrics"), or None to bypass none of those traffics. - None, Logging, Metrics, AzureServices |
|  virtualNetworkRules | array | No | Sets the virtual network rules - [VirtualNetworkRule object](#VirtualNetworkRule) |
|  ipRules | array | No | Sets the IP ACL rules - [IPRule object](#IPRule) |
|  defaultAction | enum | Yes | Specifies the default action of allow or deny when no other rules match. - Allow or Deny |


<a id="EncryptionServices" />
### EncryptionServices object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  blob | object | No | The encryption function of the blob storage service. - [EncryptionService object](#EncryptionService) |
|  file | object | No | The encryption function of the file storage service. - [EncryptionService object](#EncryptionService) |


<a id="KeyVaultProperties" />
### KeyVaultProperties object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  keyname | string | No | The name of KeyVault key. |
|  keyversion | string | No | The version of KeyVault key. |
|  keyvaulturi | string | No | The Uri of KeyVault. |


<a id="VirtualNetworkRule" />
### VirtualNetworkRule object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  id | string | Yes | Resource ID of a subnet, for example: /subscriptions/{subscriptionId}/resourceGroups/{groupName}/providers/Microsoft.Network/virtualNetworks/{vnetName}/subnets/{subnetName}. |
|  action | enum | No | The action of virtual network rule. - Allow |
|  state | enum | No | Gets the state of virtual network rule. - provisioning, deprovisioning, succeeded, failed, networkSourceDeleted |


<a id="IPRule" />
### IPRule object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  value | string | Yes | Specifies the IP or IP range in CIDR format. Only IPV4 address is allowed. |
|  action | enum | No | The action of IP ACL rule. - Allow |


<a id="EncryptionService" />
### EncryptionService object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  enabled | boolean | No | A boolean indicating whether or not the service encrypts the data as it is stored. |

