// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { SchemaPostProcessor } from '../models';
import { replaceCyclicRef } from './helpers';

export const postProcessor: SchemaPostProcessor = async (namespace, apiVersion, schema) => {
  replaceCyclicRef(schema.definitions?.MetadataDependencies?.properties?.criteria?.oneOf[0]?.items);
  replaceCyclicRef(schema.definitions?.AutomationRuleCondition?.oneOf[0]);
  replaceCyclicRef(schema.definitions?.AutomationRuleCondition?.oneOf[2]);
}