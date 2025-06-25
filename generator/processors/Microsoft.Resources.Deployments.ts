// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { SchemaPostProcessor } from '../models';
import { merge } from 'lodash';
import { apiVersionCompare } from '../utils';

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function appendProps(definition: any, props: any[]) {
  if (definition?.properties) {
    definition.properties = merge(definition.properties, ...props);
  }
}

export const postProcessor: SchemaPostProcessor = async (namespace, apiVersion, schema) => {
  appendProps(schema.tenant_resourceDefinitions?.deployments, [subscriptionProps]);
  appendProps(schema.managementGroup_resourceDefinitions?.deployments, [subscriptionProps]);
  appendProps(schema.subscription_resourceDefinitions?.deployments, [resourceGroupProps]);

  if (apiVersionCompare(apiVersion, '2018-05-01') > -1) {
    appendProps(schema.resourceDefinitions?.deployments, [subscriptionProps]);
  }
  
  if (apiVersionCompare(apiVersion, '2017-05-10') > -1) {
    appendProps(schema.resourceDefinitions?.deployments, [resourceGroupProps]);
  }
}