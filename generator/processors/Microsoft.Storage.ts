import { SchemaPostProcessor, ScopeType } from '../models';

export const postProcessor: SchemaPostProcessor = async (namespace: string, apiVersion: string, schema: any) => {
  const scopes = [
    'tenant_resourceDefinitions',
    'managementGroup_resourceDefinitions',
    'subscription_resourceDefinitions',
    'resourceDefinitions',
    'extension_resourceDefinitions'
  ].filter(scope => schema[scope])
  
  // TODO: Remove this workaround once https://github.com/Azure/autorest.azureresourceschema/pull/74 is merged
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