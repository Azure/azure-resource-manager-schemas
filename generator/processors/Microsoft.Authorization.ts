import { SchemaPostProcessor } from '../models';

export const postProcessor: SchemaPostProcessor = (_namespace: string, _apiVersion: string, schema: any) => {
    const allowedValues = schema.definitions?.ParameterDefinitionsValue?.properties?.allowedValues;
    if (allowedValues) {
        const allowedValuesItems = allowedValues.oneOf[0]?.items
        removeObjectType(allowedValuesItems);
    }
  
    const defaultValue = schema.definitions?.ParameterDefinitionsValue?.properties?.defaultValue;
    removeObjectType(defaultValue);
  
    const assignmentParameter = schema.definitions?.PolicyAssignmentProperties?.properties?.parameters;
    removeObjectType(assignmentParameter);

    const definitionParameter = schema.definitions?.PolicyDefinitionProperties?.properties?.parameters;
    removeObjectType(definitionParameter);

    const definitionReferenceParameter = schema.definitions?.PolicyDefinitionReference?.properties?.parameters;
    removeObjectType(definitionReferenceParameter);

    const setDefinitionParameter = schema.definitions?.PolicySetDefinitionProperties?.properties?.parameters;
    removeObjectType(setDefinitionParameter);
}

function removeObjectType(property: any) {
    if (property && property['type'] && property['type'] === 'object') {
        delete property['type'];
        delete property['properties'];
    }    
}

