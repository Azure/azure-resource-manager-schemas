import { SchemaPostProcessor } from '../models';

export const postProcessor: SchemaPostProcessor = (namespace: string, apiVersion: string, schema: any) => {
  const cyclicRef = schema.definitions?.LabelClass?.properties?.subclasses?.oneOf[0]?.additionalProperties;
  if (cyclicRef && cyclicRef['$ref']) {
    delete cyclicRef['$ref'];
    cyclicRef['type'] = 'object';
  }
}