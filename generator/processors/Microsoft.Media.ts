// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { SchemaPostProcessor } from '../models';
import { replaceCyclicRef } from './helpers';

export const postProcessor: SchemaPostProcessor = async (namespace, apiVersion, schema) => {
  replaceCyclicRef(schema.definitions?.JobInputs?.properties?.inputs?.oneOf[0]?.items);
  replaceCyclicRef(schema.definitions?.JobInputSequence?.properties?.inputs?.oneOf[0]?.items);
}