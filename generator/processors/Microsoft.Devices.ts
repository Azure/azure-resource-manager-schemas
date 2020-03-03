import { SchemaPostProcessor } from '../models';
import { schemasBaseUri } from '../constants';

// workaround for a bug with resource definition in Microsoft.Devices swagger spec
function replaceCertificates(definition: any) {
  if (definition && !definition.properties && definition.certificate) {
    definition.properties = {
      oneOf: [
        {
          type: 'object',
          properties: {
            certificate: definition.certificate,
          }
        },
        {
          $ref: `${schemasBaseUri}/common/definitions.json#/definitions/expression`
        }
      ]
    };
    delete definition.certificate;
  }
}

export const postProcessor: SchemaPostProcessor = (namespace: string, apiVersion: string, schema: any) => {
  replaceCertificates(schema.resourceDefinitions?.IotHubs_certificates?.properties);
  replaceCertificates(schema.definitions?.IotHubs_certificates_childResource?.properties);
}