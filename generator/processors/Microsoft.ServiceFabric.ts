// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { SchemaPostProcessor } from '../models';

export const postProcessor: SchemaPostProcessor = async (namespace, apiVersion, schema) => {

    const IpTag = schema.definitions?.IpConfigurationPublicIPAddressConfiguration?.properties?.ipTags?.oneOf[0].items;
    if (IpTag && IpTag['$ref']) {
        IpTag['$ref'] = '#/definitions/IPTag';
    }

}