// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { SchemaPostProcessor } from '../models';
import { replaceCyclicRef } from './helpers';

export const postProcessor: SchemaPostProcessor = async (namespace, apiVersion, schema) => {
  replaceCyclicRef(schema.definitions?.ModeValueInfo?.properties?.parameters?.oneOf[0]?.items);
}