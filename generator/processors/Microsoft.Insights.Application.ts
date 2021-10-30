// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { SchemaPostProcessor } from '../models';

export const postProcessor: SchemaPostProcessor = async (namespace, apiVersion, schema) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resources = Object.values<any>(schema.resourceDefinitions || {});

  for (const resource of resources) {
    // this shouldn't be a resource definition, and it causes Export failures as it contains duplicate properties "Type" and "type"
    if (resource?.properties['Type'] && resource?.properties['type']) {
      delete resource.properties['Type'];
    }
  }
}