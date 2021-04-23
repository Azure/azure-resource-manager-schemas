import { SchemaPostProcessor } from '../models';

export const postProcessor: SchemaPostProcessor = (namespace: string, apiVersion: string, schema: any) => {
  // this shouldn't be a resource definition, and it causes Export failures as it contains duplicate properties "Type" and "type"
  if (schema.resourceDefinitions['components_Annotations']) {
    delete schema.resourceDefinitions['components_Annotations'];
  }
}