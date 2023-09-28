// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { SchemaPostProcessor } from '../models';

export const postProcessor: SchemaPostProcessor = async (namespace, apiVersion, schema) => {

    var IpTag = schema.definitions?.IpConfigurationPublicIPAddressConfiguration?.properties?.ipTags?.oneOf[0].items?.$ref;
    if (IpTag != null){
        IpTag = "#/definitions/IPTag";
    }

}