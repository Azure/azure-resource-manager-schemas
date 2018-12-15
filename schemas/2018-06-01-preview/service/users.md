# Microsoft.ApiManagement/service/users template reference
API Version: 2018-06-01-preview
## Template format

To create a Microsoft.ApiManagement/service/users resource, add the following JSON to the resources section of your template.

```json
{
  "name": "string",
  "type": "Microsoft.ApiManagement/service/users",
  "apiVersion": "2018-06-01-preview",
  "properties": {
    "state": "string",
    "note": "string",
    "identities": [
      {
        "provider": "string",
        "id": "string"
      }
    ],
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "password": "string",
    "confirmation": "string"
  }
}
```
## Property values

The following tables describe the values you need to set in the schema.

<a id="Microsoft.ApiManagement/service/users" />
### Microsoft.ApiManagement/service/users object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  name | string | Yes | User identifier. Must be unique in the current API Management service instance. |
|  type | enum | Yes | Microsoft.ApiManagement/service/users |
|  apiVersion | enum | Yes | 2018-06-01-preview |
|  properties | object | Yes | User entity create contract properties. - [UserCreateParameterProperties object](#UserCreateParameterProperties) |


<a id="UserCreateParameterProperties" />
### UserCreateParameterProperties object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  state | enum | No | Account state. Specifies whether the user is active or not. Blocked users are unable to sign into the developer portal or call any APIs of subscribed products. Default state is Active. - active, blocked, pending, deleted |
|  note | string | No | Optional note about a user set by the administrator. |
|  identities | array | No | Collection of user identities. - [UserIdentityContract object](#UserIdentityContract) |
|  email | string | Yes | Email address. Must not be empty and must be unique within the service instance. |
|  firstName | string | Yes | First name. |
|  lastName | string | Yes | Last name. |
|  password | string | No | User Password. If no value is provided, a default password is generated. |
|  confirmation | enum | No | Determines the type of confirmation e-mail that will be sent to the newly created user. - signup or invite |


<a id="UserIdentityContract" />
### UserIdentityContract object
|  Name | Type | Required | Value |
|  ---- | ---- | ---- | ---- |
|  provider | string | No | Identity provider name. |
|  id | string | No | Identifier value within provider. |

