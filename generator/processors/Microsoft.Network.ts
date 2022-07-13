// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { SchemaPostProcessor } from '../models';
import { replaceCyclicRef } from './helpers';

export const postProcessor: SchemaPostProcessor = async (namespace, apiVersion, schema) => {
  replaceCyclicRef(schema.definitions?.NetworkInterfaceIPConfigurationPropertiesFormat?.properties?.VirtualNetworkTap?.oneOf[0]?.items);
  replaceCyclicRef(schema.definitions?.IPConfigurationPropertiesFormat?.properties?.Subnet?.oneOf[0]?.items);
  replaceCyclicRef(schema.definitions?.NetworkInterfaceIPConfigurationPropertiesFormat?.properties?.ApplicationGatewayBackendAddressPool?.oneOf[0]?.items);
  replaceCyclicRef(schema.definitions?.ApplicationGatewayBackendAddressPoolPropertiesFormat?.properties?.NetworkInterfaceIPConfiguration?.oneOf[0]?.items);
  replaceCyclicRef(schema.definitions?.RouteFilterPropertiesFormat?.properties?.ExpressRouteCircuitPeering?.oneOf[0]?.items);
  replaceCyclicRef(schema.definitions?.Ipv6ExpressRouteCircuitPeeringConfig?.properties?.RouteFilter?.oneOf[0]?.items);
  replaceCyclicRef(schema.definitions?.PublicIPAddressPropertiesFormat?.properties?.PublicIPAddress?.oneOf[0]?.items);
  replaceCyclicRef(schema.definitions?.CustomIpPrefixPropertiesFormat?.properties?.CustomIpPrefix?.oneOf[0]?.items);
  replaceCyclicRef(schema.definitions?.CustomIpPrefixPropertiesFormat?.properties?.CustomIpPrefix?.oneOf[0]?.items);
}