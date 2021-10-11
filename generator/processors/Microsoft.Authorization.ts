import { SchemaPostProcessor } from '../models';

export const postProcessor: SchemaPostProcessor = async (_namespace: string, _apiVersion: string, schema: any) => {
    const allowedValues = schema.definitions?.ParameterDefinitionsValue?.properties?.allowedValues;
    if (allowedValues && allowedValues.oneOf) {
        const allowedValuesItems = allowedValues.oneOf[0]?.items
        removeObjectType(allowedValuesItems);
    }
  
    const defaultValue = schema.definitions?.ParameterDefinitionsValue?.properties?.defaultValue;
    removeObjectType(defaultValue);
  
    const assignmentParameter = schema.definitions?.PolicyAssignmentProperties?.properties?.parameters;
    removeObjectType(assignmentParameter);
    removeDataplaneParameterRestriction(assignmentParameter);

    const definitionParameter = schema.definitions?.PolicyDefinitionProperties?.properties?.parameters;
    removeObjectType(definitionParameter);
    removeDataplaneParameterRestriction(definitionParameter);

    const definitionReferenceParameter = schema.definitions?.PolicyDefinitionReference?.properties?.parameters;
    removeObjectType(definitionReferenceParameter);
    removeDataplaneParameterRestriction(definitionReferenceParameter);

    const setDefinitionParameter = schema.definitions?.PolicySetDefinitionProperties?.properties?.parameters;
    removeObjectType(setDefinitionParameter);
    removeDataplaneParameterRestriction(setDefinitionParameter);
}

function removeObjectType(property: any) {
    if (property && property['type'] && property['type'] === 'object') {
        delete property['type'];
        delete property['properties'];
    }    
}

function removeDataplaneParameterRestriction(property: any) {
    if (property?.oneOf && property.oneOf[0]?.additionalProperties && property.oneOf[0]['type'] === 'object') {
        delete property['oneOf'];
    }    
}