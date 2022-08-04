// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { SchemaPostProcessor } from '../models';
import { replaceCyclicRef } from './helpers';

export const postProcessor: SchemaPostProcessor = async (namespace, apiVersion, schema) => {
  replaceCyclicRef(schema.definitions?.NetworkInterfaceIPConfigurationPropertiesFormat?.properties?.virtualNetworkTaps?.oneOf[0]?.items);
  replaceCyclicRef(schema.definitions?.NetworkInterfaceIPConfiguration?.properties?.properties?.oneOf[0]?.properties?.publicIPAddress?.oneOf[0]?.properties?.properties?.oneOf[0]?.properties?.ipConfiguration?.oneOf[0]?.properties?.properties?.oneOf[0]?.properties?.subnet?.oneOf[0]?.properties?.properties?.oneOf[0]?.properties?.networkSecurityGroup?.oneOf[0]?.properties?.properties?.oneOf[0]?.properties?.networkInterfaces?.oneOf[0].items);
  replaceCyclicRef(schema.definitions?.NetworkInterfaceIPConfigurationPropertiesFormat?.properties?.ipConfiguration?.oneOf[0]?.items);
  replaceCyclicRef(schema.definitions?.NetworkInterfaceIPConfigurationPropertiesFormat?.properties?.applictionGatewayBackendAddressPools?.oneOf[0]?.items);
  replaceCyclicRef(schema.definitions?.ApplicationGatewayBackendAddressPoolPropertiesFormat?.properties?.backendIPConfigurations?.oneOf[0]?.items);
  replaceCyclicRef(schema.definitions?.RouteFilterPropertiesFormat?.properties?.peerings?.oneOf[0]?.items);
  replaceCyclicRef(schema.definitions?.Ipv6ExpressRouteCircuitPeeringConfig?.properties?.routeFilter?.oneOf[0]?.items);
  replaceCyclicRef(schema.definitions?.PublicIPAddress?.properties?.properties?.oneOf[0]?.properties?.linkedPublicIPAddress?.oneOf[0]);
  replaceCyclicRef(schema.definitions?.PublicIPAddress?.properties?.properties?.oneOf[0]?.properties?.servicePublicIPAddress?.oneOf[0]);
  replaceCyclicRef(schema.definitions?.CustomIpPrefix?.properties?.properties?.oneOf[0]?.properties?.customIpPrefixParent?.oneOf[0]);
  replaceCyclicRef(schema.definitions?.ContainerNetworkInterfaceConfigurationPropertiesFormat?.properties?.containerNetworkInterfaces?.oneOf[0]?.items);
}
