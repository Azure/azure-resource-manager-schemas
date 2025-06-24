// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { SchemaPostProcessor } from '../models';
import { schemasBaseUri } from '../constants';
import { apiVersionCompare } from '../utils';

const resourceGroupsDefinition = (apiVersion: string) => ({
  type: 'object',
  properties: {
    name: {
      oneOf: [
        {
          type: 'string',
          pattern: '^[-\\w\\._\\(\\)]+$',
          maxLength: 90,
          description: 'the resource group name'
        },
        {
          $ref: `${schemasBaseUri}/common/definitions.json#/definitions/expression`
        }
      ],
    },
    type: {
      type: 'string',
      enum: [
        'Microsoft.Resources/resourceGroups'
      ]
    },
    apiVersion: {
      type: 'string',
      enum: [
        apiVersion
      ]
    },
    location: {
      type: 'string',
      description: 'the resource group location'
    },
    tags: {
      oneOf: [
        {
          type: 'object',
          additionalProperties: {
            type: 'string'
          }
        },
        {
          $ref: `${schemasBaseUri}/common/definitions.json#/definitions/expression`
        }
      ],
      description: 'The resource group tags.'
    },
  },
  required: [
    'name',
    'type',
    'apiVersion',
    'location'
  ],
  description: 'Microsoft.Resources/resourceGroups'
});

export const postProcessor: SchemaPostProcessor = async (namespace, apiVersion, schema) => {
  if (apiVersionCompare(apiVersion, '2018-05-01') > -1) {
    schema.subscription_resourceDefinitions = schema.subscription_resourceDefinitions ?? {};
    schema.subscription_resourceDefinitions['resourceGroups'] = resourceGroupsDefinition(apiVersion);
  }
}