// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { SchemaPostProcessor } from '../models';
import { replaceRefByName } from './helpers';

export const postProcessor: SchemaPostProcessor = async (namespace, apiVersion, schema) => {
    if (schema.definitions?.IPTag) {
        replaceRefByName(schema, 'IpTag', { '$ref': '#/definitions/IPTag' });
        delete schema.definitions.IpTag;
    }
}