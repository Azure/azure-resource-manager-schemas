import { SchemaPostProcessor, ScopeType } from '../models';

export const postProcessor: SchemaPostProcessor = (namespace: string, apiVersion: string, schema: any) => {
  const scopes = [
    'tenant_resourceDefinitions',
    'managementGroup_resourceDefinitions',
    'subscription_resourceDefinitions',
    'resourceDefinitions',
    'extension_resourceDefinitions'
  ].filter(scope => schema[scope])
  
  scopes.forEach(scope => {
    for (let key in schema[scope]) {
      const requiredArray = schema[scope][key].required
      if (requiredArray && Array.isArray(requiredArray)) {
        const index = requiredArray.indexOf('properties')
        if (index !== -1) {
          requiredArray.splice(index, 1)
        }
      }
    }
  })
}