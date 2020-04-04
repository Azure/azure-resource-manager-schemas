import { SchemaPostProcessor } from '../models';

export const postProcessor: SchemaPostProcessor = (namespace: string, apiVersion: string, schema: any) => {
  const cyclicRef = schema.definitions?.ModeValueInfo?.properties?.parameters?.oneOf[0]?.items;
  if (cyclicRef && cyclicRef['$ref']) {
    delete cyclicRef['$ref'];
    cyclicRef['type'] = 'object';
  }
}