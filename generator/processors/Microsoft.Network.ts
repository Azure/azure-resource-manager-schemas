// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { SchemaPostProcessor } from '../models';
import { replaceCyclicRefByName } from './helpers';

export const postProcessor: SchemaPostProcessor = async (namespace, apiVersion, schema) => {
  replaceCyclicRefByName(schema, 'PublicIPAddress', { type: 'object' });
  replaceCyclicRefByName(schema, 'NetworkInterface', { type: 'object' });
  replaceCyclicRefByName(schema, 'NetworkSecurityGroup', { type: 'object' });
  replaceCyclicRefByName(schema, 'RouteTable', { type: 'object' });
  replaceCyclicRefByName(schema, 'IPConfiguration', { type: 'object' });
  replaceCyclicRefByName(schema, 'BackendAddressPool', { type: 'object' });
  replaceCyclicRefByName(schema, 'InboundNatRule', { type: 'object' });
  replaceCyclicRefByName(schema, 'ApplicationGatewayBackendAddressPool', { type: 'object' });
  replaceCyclicRefByName(schema, 'ExpressRouteCircuitPeering', { type: 'object' });
  replaceCyclicRefByName(schema, 'VirtualNetworkTap', { type: 'object' });
  replaceCyclicRefByName(schema, 'ContainerNetworkInterface', { type: 'object' });
  replaceCyclicRefByName(schema, 'CustomIpPrefix', { type: 'object' });
}