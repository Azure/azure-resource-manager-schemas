import { SchemaPostProcessor } from '../models';

export const postProcessor: SchemaPostProcessor = async (namespace: string, apiVersion: string, schema: any) => {
  // this shouldn't be a resource definition, and it causes Export failures as it contains duplicate properties "Type" and "type"
  const resources = Object.values<any>(schema.resourceDefinitions || {});

  for (const resource of resources) {
    if (resource?.properties['Type'] && resource?.properties['type']) {
      delete resource.properties['Type'];
    }
  }
}