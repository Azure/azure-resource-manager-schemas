// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { SchemaPostProcessor } from '../models';
import { replaceCyclicRef } from './helpers';

export const postProcessor: SchemaPostProcessor = async (namespace, apiVersion, schema) => {
  replaceCyclicRef(schema.definitions?.NetworkInterfaceIPConfigurationPropertiesFormat?.properties?.virtualNetworkTaps?.oneOf[0]?.items);
  replaceCyclicRef(schema.definitions?.NetworkInterfaceIPConfigurationPropertiesFormat?.properties?.ipConfiguration?.oneOf[0]?.items);
  replaceCyclicRef(schema.definitions?.NetworkInterfaceIPConfigurationPropertiesFormat?.properties?.applicationGatewayBackendAddressPools?.oneOf[0]?.items);
  replaceCyclicRef(schema.definitions?.ApplicationGatewayBackendAddressPoolPropertiesFormat?.properties?.backendIPConfigurations?.oneOf[0]?.items);
  replaceCyclicRef(schema.definitions?.RouteFilterPropertiesFormat?.properties?.peerings?.oneOf[0]?.items);
  replaceCyclicRef(schema.definitions?.Ipv6ExpressRouteCircuitPeeringConfig?.properties?.routeFilter?.oneOf[0]?.items);
  replaceCyclicRef(schema.definitions?.PublicIPAddressPropertiesFormat?.properties?.linkedPublicIPAddress?.oneOf[0]);
  replaceCyclicRef(schema.definitions?.PublicIPAddressPropertiesFormat?.properties?.servicePublicIPAddress?.oneOf[0]);
  replaceCyclicRef(schema.definitions?.ContainerNetworkInterfaceConfigurationPropertiesFormat?.properties?.containerNetworkInterfaces?.oneOf[0]?.items);
  replaceCyclicRef(schema.definitions?.NetworkInterfacePropertiesFormat?.properties?.ipConfigurations?.oneOf[0]?.items);
  replaceCyclicRef(schema.definitions?.CustomIpPrefixPropertiesFormat?.properties?.customIpPrefixParent?.oneOf[0]);
  replaceCyclicRef(schema.definitions?.NetworkInterfacePropertiesFormat?.properties?.networkSecurityGroup?.oneOf[0]);
}
