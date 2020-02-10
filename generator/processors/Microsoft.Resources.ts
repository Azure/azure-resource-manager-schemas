import { SchemaPostProcessor } from '../models';
import { merge } from 'lodash';

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

export const postProcessor: SchemaPostProcessor = (namespace: string, apiVersion: string, schema: any) => {
  appendProps(schema?.tenant_resourceDefinitions?.deployments, [subscriptionProps]);
  appendProps(schema?.managementGroup_resourceDefinitions?.deployments, [subscriptionProps]);
  appendProps(schema?.subscription_resourceDefinitions?.deployments, [resourceGroupProps]);
  appendProps(schema?.resourceDefinitions?.deployments, [subscriptionProps, resourceGroupProps]);
}