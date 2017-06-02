# Microsoft.Sql/servers/elasticPools template reference
API Version: 2014-04-01-preview
## Template format

To create a Microsoft.Sql/servers/elasticPools resource, add the following JSON to the resources section of your template.

```json
{
  "name": "string",
  "type": "Microsoft.Sql/servers/elasticPools",
  "apiVersion": "2014-04-01-preview",
  "tags": {},
  "location": "string",
  "properties": {
    "edition": "string",
    "dtu": "integer",
    "databaseDtuMax": "integer",
    "databaseDtuMin": "integer",
    "storageMB": "integer"
  }
}
```
## Property values

The following tables describe the values you need to set in the schema.

<a id="Microsoft.Sql/servers/elasticPools" />
### Microsoft.Sql/servers/elasticPools object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  name | string | Yes |  |
|  type | enum | Yes | Microsoft.Sql/servers/elasticPools |
|  apiVersion | enum | Yes | 2014-04-01-preview |
|  tags | object | No | Resource tags. |
|  location | string | Yes | Resource location. |
|  properties | object | Yes | The properties representing the resource. - [ElasticPoolProperties object](#ElasticPoolProperties) |


<a id="ElasticPoolProperties" />
### ElasticPoolProperties object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  edition | enum | No | The edition of the elastic pool. - Basic, Standard, Premium |
|  dtu | integer | No | The total shared DTU for the database elastic pool. |
|  databaseDtuMax | integer | No | The maximum DTU any one database can consume. |
|  databaseDtuMin | integer | No | The minimum DTU all databases are guaranteed. |
|  storageMB | integer | No | Gets storage limit for the database elastic pool in MB. |

