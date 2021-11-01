// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { SchemaPostProcessor } from '../models';
import { replaceCyclicRef } from './helpers';

export const postProcessor: SchemaPostProcessor = async (namespace, apiVersion, schema) => {
  replaceCyclicRef(schema.definitions?.ReportConfigFilter?.properties?.and?.oneOf[0]?.items);
  replaceCyclicRef(schema.definitions?.ReportConfigFilter?.properties?.not?.oneOf[0]);
  replaceCyclicRef(schema.definitions?.ReportConfigFilter?.properties?.or?.oneOf[0]?.items);
  replaceCyclicRef(schema.definitions?.ReportFilter?.properties?.and?.oneOf[0]?.items);
  replaceCyclicRef(schema.definitions?.ReportFilter?.properties?.not?.oneOf[0]);
  replaceCyclicRef(schema.definitions?.ReportFilter?.properties?.or?.oneOf[0]?.items);
  replaceCyclicRef(schema.definitions?.QueryFilter?.properties?.and?.oneOf[0]?.items);
  replaceCyclicRef(schema.definitions?.QueryFilter?.properties?.not?.oneOf[0]);
  replaceCyclicRef(schema.definitions?.QueryFilter?.properties?.or?.oneOf[0]?.items);
  replaceCyclicRef(schema.definitions?.QueryFilterModel?.properties?.and?.oneOf[0]?.items);
  replaceCyclicRef(schema.definitions?.QueryFilterModel?.properties?.not?.oneOf[0]);
  replaceCyclicRef(schema.definitions?.QueryFilterModel?.properties?.or?.oneOf[0]?.items);
  replaceCyclicRef(schema.definitions?.Scope?.properties?.childScope?.oneOf[0]);
}