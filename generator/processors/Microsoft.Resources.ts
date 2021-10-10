import { SchemaPostProcessor, ScopeType } from '../models';
import { merge } from 'lodash';
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

const subscriptionProps = {
  subscriptionId: {
    type: 'string',
    description: 'The subscription to deploy to'
  },
};

const resourceGroupProps = {
  resourceGroup: {
    type: 'string',
    description: 'The resource group to deploy to',
    pattern: '^[-\\w\\._\\(\\)]+$',
    maxLength: 90
  },
};

function appendProps(definition: any, props: any[]) {
  if (definition?.properties) {
    definition.properties = merge(definition.properties, ...props);
  }
}

export const postProcessor: SchemaPostProcessor = async (namespace: string, apiVersion: string, schema: any) => {
  appendProps(schema.tenant_resourceDefinitions?.deployments, [subscriptionProps]);
  appendProps(schema.managementGroup_resourceDefinitions?.deployments, [subscriptionProps]);
  appendProps(schema.subscription_resourceDefinitions?.deployments, [resourceGroupProps]);

  if (apiVersionCompare(apiVersion, '2018-05-01') > -1) {
    appendProps(schema.resourceDefinitions?.deployments, [subscriptionProps]);
  }
  
  if (apiVersionCompare(apiVersion, '2017-05-10') > -1) {
    appendProps(schema.resourceDefinitions?.deployments, [resourceGroupProps]);
  }

  if (apiVersionCompare(apiVersion, '2018-05-01') > -1) {
    schema.subscription_resourceDefinitions = schema.subscription_resourceDefinitions ?? {};
    schema.subscription_resourceDefinitions['resourceGroups'] = resourceGroupsDefinition(apiVersion);
  }
}