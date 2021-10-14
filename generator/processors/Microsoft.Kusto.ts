import { SchemaPostProcessor } from '../models';
import { apiVersionCompare } from '../utils';

const clusterDataConnections = (apiVersion: string) => ({
    type: 'object',
    oneOf: [
      {
        $ref: '#/definitions/GenevaDataConnection'
      },
      {
        $ref: '#/definitions/GenevaLegacyDataConnection'
      }
    ],
    properties: {
      name: {
        type: 'string',
        description: 'The data connection name'
      },
      type: {
        enum: [
          'Microsoft.Kusto/clusters/dataConnections'
        ]
      },
      apiVersion: {
        type: 'string',
        enum: [
          apiVersion
        ]
      }
    },
    required: [
      'apiVersion',
      'properties',
      'type'
    ],
    description: 'Microsoft.Kusto/clusters/dataConnections'
});

const genevaDataConnectionProperties = () => ({
    type: 'object',
      properties: {
        genevaEnvironment: {
          type: 'string',
          'description': 'The Geneva environment of the geneva data connection.'
        }
      },
      required: [
        'genevaEnvironment'
      ],
      description: 'Class representing the Kusto Geneva (GDS) connection properties.'
});

const genevaDataConnection = () => ({
    type: 'object',
    properties: {
      properties: {
        oneOf: [
          {
            $ref: '#/definitions/GenevaDataConnectionProperties'
          },
          {
            $ref: 'https://schema.management.azure.com/schemas/common/definitions.json#/definitions/expression'
          }
        ],
        description: 'Geneva (DGS) data connection properties'
      },
      kind: {
        type: 'string',
        enum: [
          'Geneva'
        ]
      }
    },
    required: [
      'kind'
    ],
    description: 'Information about the Geneva (GDS) data connection'
});

const genevaLegacyDataConnectionProperties = () => ({
    type: 'object',
      properties: {
        genevaEnvironment: {
          type: 'string',
          description: 'The Geneva environment of the geneva data connection.'
        },
        mdsAccounts: {
          type: 'array',
          description: 'The list of mds accounts of the geneva data connection.'
        },
        isScrubbed: {
          type: 'boolean',
          description: 'Indicates whether the data is scrubbed.'
        }
      },
      required: [
        'genevaEnvironment',
        'mdsAccounts',
        'isScrubbed'
      ],
      'description': 'Class representing the Kusto Geneva legacy connection properties.'
});

const genevaLegacyDataConnection = () => ({
    type: 'object',
      properties: {
        properties: {
          oneOf: [
            {
              $ref: '#/definitions/GenevaLegacyDataConnectionProperties'
            },
            {
              $ref: 'https://schema.management.azure.com/schemas/common/definitions.json#/definitions/expression'
            }
          ],
          description: 'Geneva legacy data connection properties.'
        },
        kind: {
          type: 'string',
          enum: [
            'GenevaLegacy'
          ]
        }
      },
      required: [
        'kind'
      ],
      description: 'Information about the Geneva legacy data connection.'
});

const clusterDataConnections_childResource = () => ({
    $ref: '#/definitions/clusters_dataconnections_childResource'
});

export const postProcessor: SchemaPostProcessor = (namespace: string, apiVersion: string, schema: any) => {
    // Handle cluster data connection
    if (apiVersionCompare(apiVersion, '2019-11-09') > -1){
        const clusterSubResources = schema.resourceDefinitions.clusters.properties.resources.items.oneOf;
        clusterSubResources.push(clusterDataConnections_childResource());
        schema.resourceDefinitions.clusters.properties.resources.items.oneOf = clusterSubResources;
        const clusterDataConnectionObject = clusterDataConnections(apiVersion);
        schema['resourceDefinitions']['clusters_dataconnections'] = clusterDataConnectionObject;
        clusterDataConnectionObject.properties.type.enum = ["Microsoft.Kusto/clusters/dataconnections"];
        schema.definitions.clusters_dataconnections_childResource = clusterDataConnectionObject;
        schema.definitions.GenevaDataConnectionProperties = genevaDataConnectionProperties();
        schema.definitions.GenevaDataConnection = genevaDataConnection();
        schema.definitions.GenevaLegacyDataConnectionProperties = genevaLegacyDataConnectionProperties();
        schema.definitions.GenevaLegacyDataConnection = genevaLegacyDataConnection();
    }

    // Handle read only following database

}
