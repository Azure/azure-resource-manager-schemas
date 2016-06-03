"use strict";

const assert = require("assert");
const path = require("path");

const runSchemaTests = require("../runSchemaTests");
const utilities = require("../utilities");

suite("runSchemaTests", () => {
    suite("getProperty(string,any)", () => {
        test("with null property path", () => {
            assert.throws(() => { runSchemaTests.getProperty(null, {}); });
        });

        test("with undefined property path", () => {
            assert.throws(() => { runSchemaTests.getProperty(undefined, {}); });
        });

        test("with empty property path", () => {
            assert.throws(() => { runSchemaTests.getProperty("", {}); });
        });

        test("with top-level property path that doesn't exist", () => {
            assert.throws(() => { runSchemaTests.getProperty("name", {}); });
        });

        test("with top-level property path that exists", () => {
            const propertyValue = runSchemaTests.getProperty("name", { name: "test" });
            assert.deepStrictEqual(propertyValue, "test");
        });

        test("with child-level property path that doesn't exist", () => {
            assert.throws(() => { runSchemaTests.getProperty("child/name", { child: {} }); });
        });

        test("with child-level property path that exists", () => {
            const propertyValue = runSchemaTests.getProperty("child/name", { child: { name: "test" } });
            assert.deepStrictEqual(propertyValue, "test");
        });
    });

    test("getTestFiles()", () => {
        const testFiles = runSchemaTests.getTestFiles();
        assert(testFiles);
        assert(testFiles.length >= 1);
    });

    suite("resolveSchemaLocalReferences(any, any, string, {})", () => {
        test("with null partialJsonSchema", () => {
            assert.deepStrictEqual(runSchemaTests.resolveSchemaLocalReferences(null, null), null);
        });

        test("with undefined partialJsonSchema", () => {
            assert.deepStrictEqual(runSchemaTests.resolveSchemaLocalReferences(undefined, null), undefined);
        });

        test("with no $ref properties", () => {
            const fullJsonSchema = {
                a: {
                    b: "c"
                },
                d: {
                    e: "f"
                }
            };
            assert.deepStrictEqual(runSchemaTests.resolveSchemaLocalReferences(fullJsonSchema.a, fullJsonSchema), fullJsonSchema.a);
        });

        test("with one $ref property to a string property", () => {
            const fullJsonSchema = {
                a: {
                    b: "c"
                },
                d: {
                    e: {
                        "$ref": "#/a/b"
                    }
                }
            };
            assert.deepStrictEqual(
                runSchemaTests.resolveSchemaLocalReferences(fullJsonSchema.d, fullJsonSchema),
                {
                    e: "c"
                });
        });

        test("with one $ref property to a property that doesn't exist", () => {
            const fullJsonSchema = {
                d: {
                    e: {
                        "$ref": "#/a/b"
                    }
                }
            };
            assert.throws(() => { runSchemaTests.resolveSchemaLocalReferences(fullJsonSchema.d, fullJsonSchema); });
        });

        test("with one $ref property to an object property", () => {
            const fullJsonSchema = {
                a: {
                    b: "c"
                },
                d: {
                    e: {
                        "$ref": "#/a"
                    }
                }
            };
            assert.deepStrictEqual(
                runSchemaTests.resolveSchemaLocalReferences(fullJsonSchema.d, fullJsonSchema),
                {
                    e: {
                        b: "c"
                    }
                });
        });

        test("with one $ref property to an array property", () => {
            const fullJsonSchema = {
                a: {
                    b: ["c", "f", "g"]
                },
                d: {
                    e: {
                        "$ref": "#/a"
                    }
                }
            };
            assert.deepStrictEqual(
                runSchemaTests.resolveSchemaLocalReferences(fullJsonSchema.d, fullJsonSchema),
                {
                    e: {
                        b: ["c", "f", "g"]
                    }
                });
        });

        test("with one shallow recursive $ref property", () => {
            const fullJsonSchema = {
                a: {
                    $ref: "#/a"
                }
            };
            assert.deepStrictEqual(
                runSchemaTests.resolveSchemaLocalReferences(fullJsonSchema.a, fullJsonSchema),
                {
                    $ref: "#"
                });
        });

        test("with one deep recursive $ref property", () => {
            const fullJsonSchema = {
                a: {
                    b: {
                        c: {
                            $ref: "#/a/b"
                        }
                    }
                }
            };
            assert.deepStrictEqual(
                runSchemaTests.resolveSchemaLocalReferences(fullJsonSchema.a, fullJsonSchema),
                {
                    b: {
                        c: {
                            c: {
                                $ref: "#/b/c"
                            }
                        }
                    }
                });
        });

        test("with multiple $ref properties", () => {
            const fullJsonSchema = {
                a: {
                    aa: {
                        aaa: 123
                    }
                },
                b: {
                    bb: {
                        name: "b1",
                        bbb: {
                            $ref: "#/a"
                        }
                    }
                },
                c: {
                    cc: {
                        name: "b2",
                        ccc: {
                            $ref: "#/b"
                        }
                    }
                }
            };
            assert.deepStrictEqual(
                runSchemaTests.resolveSchemaLocalReferences(fullJsonSchema.c, fullJsonSchema),
                {
                    cc: {
                        name: "b2",
                        ccc: {
                            bb: {
                                name: "b1",
                                bbb: {
                                    aa: {
                                        aaa: 123
                                    }
                                }
                            }
                        }
                    }
                });
        });

        test("with Microsoft.Network.json#/resourceDefinitions/connections", () => {
            const fullSchemaJson = {
                "id": "http://schema.management.azure.com/schemas/2016-03-30/Microsoft.Network.json#",
                "$schema": "http://json-schema.org/draft-04/schema#",
                "title": "Microsoft.Network",
                "description": "Microsoft Network Resource Types",
                "resourceDefinitions": {
                    connections: {
                        "type": "object",
                        "properties": {
                            "type": {
                                "type": "string",
                                "enum": [
                                    "Microsoft.Network/connections"
                                ]
                            },
                            "apiVersion": {
                                "type": "string",
                                "enum": [
                                    "2016-03-30"
                                ]
                            },
                            "properties": {
                                "oneOf": [
                                    {
                                        "$ref": "#/definitions/VirtualNetworkGatewayConnectionPropertiesFormat"
                                    },
                                    {
                                        "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                    }
                                ]
                            },
                            "etag": {
                                "type": "string",
                                "description": "Gets a unique read-only string that changes whenever the resource is updated"
                            }
                        },
                        "required": [
                            "type",
                            "apiVersion",
                            "properties"
                        ],
                        "description": "Microsoft.Network/connections"
                    }
                },
                "definitions": {
                    "AddressSpace": {
                        "type": "object",
                        "properties": {
                            "addressPrefixes": {
                                "oneOf": [
                                    {
                                        "type": "array",
                                        "items": {
                                            "type": "string"
                                        }
                                    },
                                    {
                                        "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                    }
                                ],
                                "description": "Gets or sets List of address blocks reserved for this virtual network in CIDR notation"
                            }
                        },
                        "description": "AddressSpace contains an array of IP address ranges that can be used by subnets"
                    },
                    "BgpSettings": {
                        "type": "object",
                        "properties": {
                            "asn": {
                                "oneOf": [
                                    {
                                        "type": "integer"
                                    },
                                    {
                                        "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                    }
                                ],
                                "description": "Gets or sets this BGP speaker's ASN"
                            },
                            "bgpPeeringAddress": {
                                "type": "string",
                                "description": "Gets or sets the BGP peering address and BGP identifier of this BGP speaker"
                            },
                            "peerWeight": {
                                "oneOf": [
                                    {
                                        "type": "integer"
                                    },
                                    {
                                        "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                    }
                                ],
                                "description": "Gets or sets the weight added to routes learned from this BGP speaker"
                            }
                        }
                    },
                    "LocalNetworkGateway": {
                        "type": "object",
                        "properties": {
                            "id": {
                                "type": "string",
                                "description": "Resource Id"
                            },
                            "location": {
                                "type": "string",
                                "description": "Resource location"
                            },
                            "tags": {
                                "oneOf": [
                                    {
                                        "type": "object",
                                        "additionalProperties": {
                                            "type": "string"
                                        }
                                    },
                                    {
                                        "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                    }
                                ],
                                "description": "Resource tags"
                            },
                            "properties": {
                                "oneOf": [
                                    {
                                        "$ref": "#/definitions/LocalNetworkGatewayPropertiesFormat"
                                    },
                                    {
                                        "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                    }
                                ]
                            },
                            "etag": {
                                "type": "string",
                                "description": "Gets a unique read-only string that changes whenever the resource is updated"
                            }
                        },
                        "description": "A common class for general resource information"
                    },
                    "LocalNetworkGatewayPropertiesFormat": {
                        "type": "object",
                        "properties": {
                            "localNetworkAddressSpace": {
                                "oneOf": [
                                    {
                                        "$ref": "#/definitions/AddressSpace"
                                    },
                                    {
                                        "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                    }
                                ],
                                "description": "Local network site Address space"
                            },
                            "gatewayIpAddress": {
                                "type": "string",
                                "description": "IP address of local network gateway."
                            },
                            "bgpSettings": {
                                "oneOf": [
                                    {
                                        "$ref": "#/definitions/BgpSettings"
                                    },
                                    {
                                        "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                    }
                                ],
                                "description": "Local network gateway's BGP speaker settings"
                            },
                            "resourceGuid": {
                                "type": "string",
                                "description": "Gets or sets resource guid property of the LocalNetworkGateway resource"
                            },
                            "provisioningState": {
                                "type": "string",
                                "description": "Gets or sets Provisioning state of the LocalNetworkGateway resource Updating/Deleting/Failed"
                            }
                        },
                        "description": "LocalNetworkGateway properties"
                    },
                    "SubResource": {
                        "type": "object",
                        "properties": {
                            "id": {
                                "type": "string",
                                "description": "Resource Id"
                            }
                        }
                    },
                    "VirtualNetworkGateway": {
                        "type": "object",
                        "properties": {
                            "id": {
                                "type": "string",
                                "description": "Resource Id"
                            },
                            "location": {
                                "type": "string",
                                "description": "Resource location"
                            },
                            "tags": {
                                "oneOf": [
                                    {
                                        "type": "object",
                                        "additionalProperties": {
                                            "type": "string"
                                        }
                                    },
                                    {
                                        "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                    }
                                ],
                                "description": "Resource tags"
                            },
                            "properties": {
                                "oneOf": [
                                    {
                                        "$ref": "#/definitions/VirtualNetworkGatewayPropertiesFormat"
                                    },
                                    {
                                        "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                    }
                                ]
                            },
                            "etag": {
                                "type": "string",
                                "description": "Gets a unique read-only string that changes whenever the resource is updated"
                            }
                        },
                        "description": "A common class for general resource information"
                    },
                    "VirtualNetworkGatewayConnectionPropertiesFormat": {
                        "type": "object",
                        "properties": {
                            "authorizationKey": {
                                "type": "string",
                                "description": "The authorizationKey."
                            },
                            "virtualNetworkGateway1": {
                                "oneOf": [
                                    {
                                        "$ref": "#/definitions/VirtualNetworkGateway"
                                    },
                                    {
                                        "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                    }
                                ]
                            },
                            "virtualNetworkGateway2": {
                                "oneOf": [
                                    {
                                        "$ref": "#/definitions/VirtualNetworkGateway"
                                    },
                                    {
                                        "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                    }
                                ]
                            },
                            "localNetworkGateway2": {
                                "oneOf": [
                                    {
                                        "$ref": "#/definitions/LocalNetworkGateway"
                                    },
                                    {
                                        "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                    }
                                ]
                            },
                            "connectionType": {
                                "oneOf": [
                                    {
                                        "type": "string",
                                        "enum": [
                                            "IPsec",
                                            "Vnet2Vnet",
                                            "ExpressRoute",
                                            "VPNClient"
                                        ]
                                    },
                                    {
                                        "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                    }
                                ],
                                "description": "Gateway connection type -Ipsec/Dedicated/VpnClient/Vnet2Vnet. Possible values include: 'IPsec', 'Vnet2Vnet', 'ExpressRoute', 'VPNClient'"
                            },
                            "routingWeight": {
                                "oneOf": [
                                    {
                                        "type": "integer"
                                    },
                                    {
                                        "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                    }
                                ],
                                "description": "The Routing weight."
                            },
                            "sharedKey": {
                                "type": "string",
                                "description": "The Ipsec share key."
                            },
                            "connectionStatus": {
                                "oneOf": [
                                    {
                                        "type": "string",
                                        "enum": [
                                            "Unknown",
                                            "Connecting",
                                            "Connected",
                                            "NotConnected"
                                        ]
                                    },
                                    {
                                        "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                    }
                                ],
                                "description": "Virtual network Gateway connection status. Possible values include: 'Unknown', 'Connecting', 'Connected', 'NotConnected'"
                            },
                            "egressBytesTransferred": {
                                "oneOf": [
                                    {
                                        "type": "integer"
                                    },
                                    {
                                        "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                    }
                                ],
                                "description": "The Egress Bytes Transferred in this connection"
                            },
                            "ingressBytesTransferred": {
                                "oneOf": [
                                    {
                                        "type": "integer"
                                    },
                                    {
                                        "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                    }
                                ],
                                "description": "The Ingress Bytes Transferred in this connection"
                            },
                            "peer": {
                                "oneOf": [
                                    {
                                        "$ref": "#/definitions/SubResource"
                                    },
                                    {
                                        "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                    }
                                ],
                                "description": "The reference to peerings resource."
                            },
                            "enableBgp": {
                                "oneOf": [
                                    {
                                        "type": "boolean"
                                    },
                                    {
                                        "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                    }
                                ],
                                "description": "EnableBgp Flag"
                            },
                            "resourceGuid": {
                                "type": "string",
                                "description": "Gets or sets resource guid property of the VirtualNetworkGatewayConnection resource"
                            },
                            "provisioningState": {
                                "type": "string",
                                "description": "Gets or sets Provisioning state of the VirtualNetworkGatewayConnection resource Updating/Deleting/Failed"
                            }
                        },
                        "description": "VirtualNeworkGatewayConnection properties"
                    },
                    "VirtualNetworkGatewayIPConfiguration": {
                        "type": "object",
                        "properties": {
                            "id": {
                                "type": "string",
                                "description": "Resource Id"
                            },
                            "properties": {
                                "oneOf": [
                                    {
                                        "$ref": "#/definitions/VirtualNetworkGatewayIPConfigurationPropertiesFormat"
                                    },
                                    {
                                        "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                    }
                                ]
                            },
                            "name": {
                                "type": "string",
                                "description": "Gets name of the resource that is unique within a resource group. This name can be used to access the resource"
                            },
                            "etag": {
                                "type": "string",
                                "description": "A unique read-only string that changes whenever the resource is updated"
                            }
                        },
                        "description": "IpConfiguration for Virtual network gateway"
                    },
                    "VirtualNetworkGatewayIPConfigurationPropertiesFormat": {
                        "type": "object",
                        "properties": {
                            "privateIPAddress": {
                                "type": "string",
                                "description": "Gets or sets the privateIPAddress of the IP Configuration"
                            },
                            "privateIPAllocationMethod": {
                                "oneOf": [
                                    {
                                        "type": "string",
                                        "enum": [
                                            "Static",
                                            "Dynamic"
                                        ]
                                    },
                                    {
                                        "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                    }
                                ],
                                "description": "Gets or sets PrivateIP allocation method (Static/Dynamic). Possible values include: 'Static', 'Dynamic'"
                            },
                            "subnet": {
                                "oneOf": [
                                    {
                                        "$ref": "#/definitions/SubResource"
                                    },
                                    {
                                        "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                    }
                                ],
                                "description": "Gets or sets the reference of the subnet resource"
                            },
                            "publicIPAddress": {
                                "oneOf": [
                                    {
                                        "$ref": "#/definitions/SubResource"
                                    },
                                    {
                                        "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                    }
                                ],
                                "description": "Gets or sets the reference of the PublicIP resource"
                            },
                            "provisioningState": {
                                "type": "string",
                                "description": "Gets or sets Provisioning state of the PublicIP resource Updating/Deleting/Failed"
                            }
                        },
                        "description": "Properties of VirtualNetworkGatewayIPConfiguration"
                    },
                    "VirtualNetworkGatewayPropertiesFormat": {
                        "type": "object",
                        "properties": {
                            "ipConfigurations": {
                                "oneOf": [
                                    {
                                        "type": "array",
                                        "items": {
                                            "$ref": "#/definitions/VirtualNetworkGatewayIPConfiguration"
                                        }
                                    },
                                    {
                                        "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                    }
                                ],
                                "description": "IpConfigurations for Virtual network gateway."
                            },
                            "gatewayType": {
                                "oneOf": [
                                    {
                                        "type": "string",
                                        "enum": [
                                            "Vpn",
                                            "ExpressRoute"
                                        ]
                                    },
                                    {
                                        "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                    }
                                ],
                                "description": "The type of this virtual network gateway. Possible values include: 'Vpn', 'ExpressRoute'"
                            },
                            "vpnType": {
                                "oneOf": [
                                    {
                                        "type": "string",
                                        "enum": [
                                            "PolicyBased",
                                            "RouteBased"
                                        ]
                                    },
                                    {
                                        "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                    }
                                ],
                                "description": "The type of this virtual network gateway. Possible values include: 'PolicyBased', 'RouteBased'"
                            },
                            "enableBgp": {
                                "oneOf": [
                                    {
                                        "type": "boolean"
                                    },
                                    {
                                        "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                    }
                                ],
                                "description": "EnableBgp Flag"
                            },
                            "gatewayDefaultSite": {
                                "oneOf": [
                                    {
                                        "$ref": "#/definitions/SubResource"
                                    },
                                    {
                                        "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                    }
                                ],
                                "description": "Gets or sets the reference of the LocalNetworkGateway resource which represents Local network site having default routes. Assign Null value in case of removing existing default site setting."
                            },
                            "sku": {
                                "oneOf": [
                                    {
                                        "$ref": "#/definitions/VirtualNetworkGatewaySku"
                                    },
                                    {
                                        "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                    }
                                ],
                                "description": "Gets or sets the reference of the VirtualNetworkGatewaySku resource which represents the sku selected for Virtual network gateway."
                            },
                            "vpnClientConfiguration": {
                                "oneOf": [
                                    {
                                        "$ref": "#/definitions/VpnClientConfiguration"
                                    },
                                    {
                                        "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                    }
                                ],
                                "description": "Gets or sets the reference of the VpnClientConfiguration resource which represents the P2S VpnClient configurations."
                            },
                            "bgpSettings": {
                                "oneOf": [
                                    {
                                        "$ref": "#/definitions/BgpSettings"
                                    },
                                    {
                                        "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                    }
                                ],
                                "description": "Virtual network gateway's BGP speaker settings"
                            },
                            "resourceGuid": {
                                "type": "string",
                                "description": "Gets or sets resource guid property of the VirtualNetworkGateway resource"
                            },
                            "provisioningState": {
                                "type": "string",
                                "description": "Gets or sets Provisioning state of the VirtualNetworkGateway resource Updating/Deleting/Failed"
                            }
                        },
                        "description": "VirtualNeworkGateay properties"
                    },
                    "VirtualNetworkGatewaySku": {
                        "type": "object",
                        "properties": {
                            "name": {
                                "oneOf": [
                                    {
                                        "type": "string",
                                        "enum": [
                                            "Basic",
                                            "HighPerformance",
                                            "Standard"
                                        ]
                                    },
                                    {
                                        "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                    }
                                ],
                                "description": "Gateway sku name -Basic/HighPerformance/Standard. Possible values include: 'Basic', 'HighPerformance', 'Standard'"
                            },
                            "tier": {
                                "oneOf": [
                                    {
                                        "type": "string",
                                        "enum": [
                                            "Basic",
                                            "HighPerformance",
                                            "Standard"
                                        ]
                                    },
                                    {
                                        "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                    }
                                ],
                                "description": "Gateway sku tier -Basic/HighPerformance/Standard. Possible values include: 'Basic', 'HighPerformance', 'Standard'"
                            },
                            "capacity": {
                                "oneOf": [
                                    {
                                        "type": "integer"
                                    },
                                    {
                                        "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                    }
                                ],
                                "description": "The capacity"
                            }
                        },
                        "description": "VirtualNetworkGatewaySku details"
                    },
                    "VpnClientConfiguration": {
                        "type": "object",
                        "properties": {
                            "vpnClientAddressPool": {
                                "oneOf": [
                                    {
                                        "$ref": "#/definitions/AddressSpace"
                                    },
                                    {
                                        "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                    }
                                ],
                                "description": "Gets or sets the reference of the Address space resource which represents Address space for P2S VpnClient."
                            },
                            "vpnClientRootCertificates": {
                                "oneOf": [
                                    {
                                        "type": "array",
                                        "items": {
                                            "$ref": "#/definitions/VpnClientRootCertificate"
                                        }
                                    },
                                    {
                                        "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                    }
                                ],
                                "description": "VpnClientRootCertificate for Virtual network gateway."
                            },
                            "vpnClientRevokedCertificates": {
                                "oneOf": [
                                    {
                                        "type": "array",
                                        "items": {
                                            "$ref": "#/definitions/VpnClientRevokedCertificate"
                                        }
                                    },
                                    {
                                        "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                    }
                                ],
                                "description": "VpnClientRevokedCertificate for Virtual network gateway."
                            }
                        },
                        "description": "VpnClientConfiguration for P2S client"
                    },
                    "VpnClientRevokedCertificate": {
                        "type": "object",
                        "properties": {
                            "id": {
                                "type": "string",
                                "description": "Resource Id"
                            },
                            "properties": {
                                "oneOf": [
                                    {
                                        "$ref": "#/definitions/VpnClientRevokedCertificatePropertiesFormat"
                                    },
                                    {
                                        "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                    }
                                ]
                            },
                            "name": {
                                "type": "string",
                                "description": "Gets name of the resource that is unique within a resource group. This name can be used to access the resource"
                            },
                            "etag": {
                                "type": "string",
                                "description": "A unique read-only string that changes whenever the resource is updated"
                            }
                        },
                        "description": "VPN client revoked certificate of virtual network gateway"
                    },
                    "VpnClientRevokedCertificatePropertiesFormat": {
                        "type": "object",
                        "properties": {
                            "thumbprint": {
                                "type": "string",
                                "description": "Gets or sets the revoked Vpn client certificate thumbprint"
                            },
                            "provisioningState": {
                                "type": "string",
                                "description": "Gets or sets Provisioning state of the VPN client revoked certificate resource Updating/Deleting/Failed"
                            }
                        },
                        "description": "Properties of the revoked VPN client certificate of virtual network gateway"
                    },
                    "VpnClientRootCertificate": {
                        "type": "object",
                        "properties": {
                            "id": {
                                "type": "string",
                                "description": "Resource Id"
                            },
                            "properties": {
                                "oneOf": [
                                    {
                                        "$ref": "#/definitions/VpnClientRootCertificatePropertiesFormat"
                                    },
                                    {
                                        "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                    }
                                ]
                            },
                            "name": {
                                "type": "string",
                                "description": "Gets name of the resource that is unique within a resource group. This name can be used to access the resource"
                            },
                            "etag": {
                                "type": "string",
                                "description": "A unique read-only string that changes whenever the resource is updated"
                            }
                        },
                        "description": "VPN client root certificate of virtual network gateway"
                    },
                    "VpnClientRootCertificatePropertiesFormat": {
                        "type": "object",
                        "properties": {
                            "publicCertData": {
                                "type": "string",
                                "description": "Gets or sets the certificate public data"
                            },
                            "provisioningState": {
                                "type": "string",
                                "description": "Gets or sets Provisioning state of the VPN client root certificate resource Updating/Deleting/Failed"
                            }
                        },
                        "description": "Properties of SSL certificates of application gateway"
                    }
                }
            };

            assert.deepStrictEqual(
                runSchemaTests.resolveSchemaLocalReferences(fullSchemaJson.resourceDefinitions.connections, fullSchemaJson),
                {
                    type: "object",
                    properties: {
                        type: {
                            type: "string",
                            enum: [
                                "Microsoft.Network/connections"
                            ]
                        },
                        apiVersion: {
                            type: "string",
                            enum: [
                                "2016-03-30"
                            ]
                        },
                        etag: {
                            description: "Gets a unique read-only string that changes whenever the resource is updated",
                            type: "string"
                        },
                        properties: {
                            oneOf: [
                                {
                                    description: "VirtualNeworkGatewayConnection properties",
                                    properties: {
                                        authorizationKey: {
                                            description: "The authorizationKey.",
                                            type: "string"
                                        },
                                        connectionStatus: {
                                            description: "Virtual network Gateway connection status. Possible values include: 'Unknown', 'Connecting', 'Connected', 'NotConnected'",
                                            oneOf: [
                                                {
                                                    enum: [
                                                        "Unknown",
                                                        "Connecting",
                                                        "Connected",
                                                        "NotConnected",
                                                    ],
                                                    type: "string"
                                                },
                                                {
                                                    "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                                }
                                            ]
                                        },
                                        connectionType: {
                                            description: "Gateway connection type -Ipsec/Dedicated/VpnClient/Vnet2Vnet. Possible values include: 'IPsec', 'Vnet2Vnet', 'ExpressRoute', 'VPNClient'",
                                            oneOf: [
                                                {
                                                    enum: [
                                                        "IPsec",
                                                        "Vnet2Vnet",
                                                        "ExpressRoute",
                                                        "VPNClient"
                                                    ],
                                                    type: "string"
                                                },
                                                {
                                                    "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                                }
                                            ]
                                        },
                                        "egressBytesTransferred": {
                                            "description": "The Egress Bytes Transferred in this connection",
                                            "oneOf": [
                                                {
                                                    "type": "integer"
                                                },
                                                {
                                                    "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                                }
                                            ]
                                        },
                                        "enableBgp": {
                                            "description": "EnableBgp Flag",
                                            "oneOf": [
                                                {
                                                    "type": "boolean"
                                                },
                                                {
                                                    "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                                }
                                            ]
                                        },
                                        "ingressBytesTransferred": {
                                            "description": "The Ingress Bytes Transferred in this connection",
                                            "oneOf": [
                                                {
                                                    "type": "integer"
                                                },
                                                {
                                                    "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                                }
                                            ]
                                        },
                                        "localNetworkGateway2": {
                                            "oneOf": [
                                                {
                                                    "description": "A common class for general resource information",
                                                    "properties": {
                                                        "etag": {
                                                            "description": "Gets a unique read-only string that changes whenever the resource is updated",
                                                            "type": "string"
                                                        },
                                                        "id": {
                                                            "description": "Resource Id",
                                                            "type": "string"
                                                        },
                                                        "location": {
                                                            "description": "Resource location",
                                                            "type": "string"
                                                        },
                                                        "properties": {
                                                            "oneOf": [
                                                                {
                                                                    "description": "LocalNetworkGateway properties",
                                                                    "properties": {
                                                                        "bgpSettings": {
                                                                            "description": "Local network gateway's BGP speaker settings",
                                                                            "oneOf": [
                                                                                {
                                                                                    "$ref": "definitions/VirtualNetworkGatewayPropertiesFormat/properties/bgpSettings/oneOf/0"
                                                                                },
                                                                                {
                                                                                    "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                                                                }
                                                                            ]
                                                                        },
                                                                        "gatewayIpAddress": {
                                                                            "description": "IP address of local network gateway.",
                                                                            "type": "string"
                                                                        },
                                                                        "localNetworkAddressSpace": {
                                                                            "description": "Local network site Address space",
                                                                            "oneOf": [
                                                                                {
                                                                                    "$ref": "definitions/VpnClientConfiguration/properties/vpnClientAddressPool/oneOf/0"
                                                                                },
                                                                                {
                                                                                    "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                                                                }
                                                                            ]
                                                                        },
                                                                        "provisioningState": {
                                                                            "description": "Gets or sets Provisioning state of the LocalNetworkGateway resource Updating/Deleting/Failed",
                                                                            "type": "string"
                                                                        },
                                                                        "resourceGuid": {
                                                                            "description": "Gets or sets resource guid property of the LocalNetworkGateway resource",
                                                                            "type": "string"
                                                                        }
                                                                    },
                                                                    "type": "object"
                                                                },
                                                                {
                                                                    "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                                                }
                                                            ]
                                                        },
                                                        "tags": {
                                                            "description": "Resource tags",
                                                            "oneOf": [
                                                                {
                                                                    "additionalProperties": {
                                                                        "type": "string"
                                                                    },
                                                                    "type": "object"
                                                                },
                                                                {
                                                                    "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                                                }
                                                            ]
                                                        }
                                                    },
                                                    "type": "object"
                                                },
                                                {
                                                    "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                                }
                                            ]
                                        },
                                        "peer": {
                                            "description": "The reference to peerings resource.",
                                            "oneOf": [
                                                {
                                                    "$ref": "definitions/VirtualNetworkGatewayIPConfigurationPropertiesFormat/properties/subnet/oneOf/0"
                                                },
                                                {
                                                    "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                                }
                                            ]
                                        },
                                        "provisioningState": {
                                            "description": "Gets or sets Provisioning state of the VirtualNetworkGatewayConnection resource Updating/Deleting/Failed",
                                            "type": "string"
                                        },
                                        "resourceGuid": {
                                            "description": "Gets or sets resource guid property of the VirtualNetworkGatewayConnection resource",
                                            "type": "string"
                                        },
                                        "routingWeight": {
                                            "description": "The Routing weight.",
                                            "oneOf": [
                                                {
                                                    "type": "integer"
                                                },
                                                {
                                                    "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                                }
                                            ]
                                        },
                                        "sharedKey": {
                                            "description": "The Ipsec share key.",
                                            "type": "string"
                                        },
                                        "virtualNetworkGateway1": {
                                            "oneOf": [
                                                {
                                                    "description": "A common class for general resource information",
                                                    "properties": {
                                                        "etag": {
                                                            "description": "Gets a unique read-only string that changes whenever the resource is updated",
                                                            "type": "string"
                                                        },
                                                        "id": {
                                                            "description": "Resource Id",
                                                            "type": "string"
                                                        },
                                                        "location": {
                                                            "description": "Resource location",
                                                            "type": "string"
                                                        },
                                                        "properties": {
                                                            "oneOf": [
                                                                {
                                                                    "description": "VirtualNeworkGateay properties",
                                                                    "properties": {
                                                                        "bgpSettings": {
                                                                            "description": "Virtual network gateway's BGP speaker settings",
                                                                            "oneOf": [
                                                                                {
                                                                                    "properties": {
                                                                                        "asn": {
                                                                                            "description": "Gets or sets this BGP speaker's ASN",
                                                                                            "oneOf": [
                                                                                                {
                                                                                                    "type": "integer"
                                                                                                },
                                                                                                {
                                                                                                    "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                                                                                }
                                                                                            ]
                                                                                        },
                                                                                        "bgpPeeringAddress": {
                                                                                            "description": "Gets or sets the BGP peering address and BGP identifier of this BGP speaker",
                                                                                            "type": "string"
                                                                                        },
                                                                                        "peerWeight": {
                                                                                            "description": "Gets or sets the weight added to routes learned from this BGP speaker",
                                                                                            "oneOf": [
                                                                                                {
                                                                                                    "type": "integer"
                                                                                                },
                                                                                                {
                                                                                                    "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                                                                                }
                                                                                            ]
                                                                                        }
                                                                                    },
                                                                                    "type": "object"
                                                                                },
                                                                                {
                                                                                    "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                                                                }
                                                                            ]
                                                                        },
                                                                        "enableBgp": {
                                                                            "description": "EnableBgp Flag",
                                                                            "oneOf": [
                                                                                {
                                                                                    "type": "boolean"
                                                                                },
                                                                                {
                                                                                    "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                                                                }
                                                                            ]
                                                                        },
                                                                        "gatewayDefaultSite": {
                                                                            "description": "Gets or sets the reference of the LocalNetworkGateway resource which represents Local network site having default routes. Assign Null value in case of removing existing default site setting.",
                                                                            "oneOf": [
                                                                                {
                                                                                    "$ref": "definitions/VirtualNetworkGatewayIPConfigurationPropertiesFormat/properties/subnet/oneOf/0"
                                                                                },
                                                                                {
                                                                                    "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                                                                }
                                                                            ]
                                                                        },
                                                                        "gatewayType": {
                                                                            "description": "The type of this virtual network gateway. Possible values include: 'Vpn', 'ExpressRoute'",
                                                                            "oneOf": [
                                                                                {
                                                                                    "enum": [
                                                                                        "Vpn",
                                                                                        "ExpressRoute"
                                                                                    ],
                                                                                    "type": "string"
                                                                                },
                                                                                {
                                                                                    "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                                                                }
                                                                            ]
                                                                        },
                                                                        "ipConfigurations": {
                                                                            "description": "IpConfigurations for Virtual network gateway.",
                                                                            "oneOf": [
                                                                                {
                                                                                    "items": {
                                                                                        "description": "IpConfiguration for Virtual network gateway",
                                                                                        "properties": {
                                                                                            "etag": {
                                                                                                "description": "A unique read-only string that changes whenever the resource is updated",
                                                                                                "type": "string"
                                                                                            },
                                                                                            "id": {
                                                                                                "description": "Resource Id",
                                                                                                "type": "string"
                                                                                            },
                                                                                            "name": {
                                                                                                "description": "Gets name of the resource that is unique within a resource group. This name can be used to access the resource",
                                                                                                "type": "string"
                                                                                            },
                                                                                            "properties": {
                                                                                                "oneOf": [
                                                                                                    {
                                                                                                        "description": "Properties of VirtualNetworkGatewayIPConfiguration",
                                                                                                        "properties": {
                                                                                                            "privateIPAddress": {
                                                                                                                "description": "Gets or sets the privateIPAddress of the IP Configuration",
                                                                                                                "type": "string"
                                                                                                            },
                                                                                                            "privateIPAllocationMethod": {
                                                                                                                "description": "Gets or sets PrivateIP allocation method (Static/Dynamic). Possible values include: 'Static', 'Dynamic'",
                                                                                                                "oneOf": [
                                                                                                                    {
                                                                                                                        "enum": [
                                                                                                                            "Static",
                                                                                                                            "Dynamic"
                                                                                                                        ],
                                                                                                                        "type": "string"
                                                                                                                    },
                                                                                                                    {
                                                                                                                        "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                                                                                                    }
                                                                                                                ]
                                                                                                            },
                                                                                                            "provisioningState": {
                                                                                                                "description": "Gets or sets Provisioning state of the PublicIP resource Updating/Deleting/Failed",
                                                                                                                "type": "string"
                                                                                                            },
                                                                                                            "publicIPAddress": {
                                                                                                                "description": "Gets or sets the reference of the PublicIP resource",
                                                                                                                "oneOf": [
                                                                                                                    {
                                                                                                                        "$ref": "definitions/VirtualNetworkGatewayIPConfigurationPropertiesFormat/properties/subnet/oneOf/0"
                                                                                                                    },
                                                                                                                    {
                                                                                                                        "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                                                                                                    }
                                                                                                                ]
                                                                                                            },
                                                                                                            "subnet": {
                                                                                                                "description": "Gets or sets the reference of the subnet resource",
                                                                                                                "oneOf": [
                                                                                                                    {
                                                                                                                        "properties": {
                                                                                                                            "id": {
                                                                                                                                "description": "Resource Id",
                                                                                                                                "type": "string"
                                                                                                                            }
                                                                                                                        },
                                                                                                                        "type": "object"
                                                                                                                    },
                                                                                                                    {
                                                                                                                        "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                                                                                                    }
                                                                                                                ]
                                                                                                            }
                                                                                                        },
                                                                                                        "type": "object"
                                                                                                    },
                                                                                                    {
                                                                                                        "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                                                                                    }
                                                                                                ]
                                                                                            }
                                                                                        },
                                                                                        "type": "object"
                                                                                    },
                                                                                    "type": "array"
                                                                                },
                                                                                {
                                                                                    "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                                                                }
                                                                            ]
                                                                        },
                                                                        "provisioningState": {
                                                                            "description": "Gets or sets Provisioning state of the VirtualNetworkGateway resource Updating/Deleting/Failed",
                                                                            "type": "string"
                                                                        },
                                                                        "resourceGuid": {
                                                                            "description": "Gets or sets resource guid property of the VirtualNetworkGateway resource",
                                                                            "type": "string"
                                                                        },
                                                                        "sku": {
                                                                            "description": "Gets or sets the reference of the VirtualNetworkGatewaySku resource which represents the sku selected for Virtual network gateway.",
                                                                            "oneOf": [
                                                                                {
                                                                                    "description": "VirtualNetworkGatewaySku details",
                                                                                    "properties": {
                                                                                        "capacity": {
                                                                                            "description": "The capacity",
                                                                                            "oneOf": [
                                                                                                {
                                                                                                    "type": "integer"
                                                                                                },
                                                                                                {
                                                                                                    "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                                                                                }
                                                                                            ]
                                                                                        },
                                                                                        "name": {
                                                                                            "description": "Gateway sku name -Basic/HighPerformance/Standard. Possible values include: 'Basic', 'HighPerformance', 'Standard'",
                                                                                            "oneOf": [
                                                                                                {
                                                                                                    "enum": [
                                                                                                        "Basic",
                                                                                                        "HighPerformance",
                                                                                                        "Standard",
                                                                                                    ],
                                                                                                    "type": "string"
                                                                                                },
                                                                                                {
                                                                                                    "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                                                                                }
                                                                                            ]
                                                                                        },
                                                                                        "tier": {
                                                                                            "description": "Gateway sku tier -Basic/HighPerformance/Standard. Possible values include: 'Basic', 'HighPerformance', 'Standard'",
                                                                                            "oneOf": [
                                                                                                {
                                                                                                    "enum": [
                                                                                                        "Basic",
                                                                                                        "HighPerformance",
                                                                                                        "Standard",
                                                                                                    ],
                                                                                                    "type": "string"
                                                                                                },
                                                                                                {
                                                                                                    "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                                                                                }
                                                                                            ]
                                                                                        }
                                                                                    },
                                                                                    "type": "object"
                                                                                },
                                                                                {
                                                                                    "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                                                                }
                                                                            ]
                                                                        },
                                                                        "vpnClientConfiguration": {
                                                                            "description": "Gets or sets the reference of the VpnClientConfiguration resource which represents the P2S VpnClient configurations.",
                                                                            "oneOf": [
                                                                                {
                                                                                    "description": "VpnClientConfiguration for P2S client",
                                                                                    "properties": {
                                                                                        "vpnClientAddressPool": {
                                                                                            "description": "Gets or sets the reference of the Address space resource which represents Address space for P2S VpnClient.",
                                                                                            "oneOf": [
                                                                                                {
                                                                                                    "description": "AddressSpace contains an array of IP address ranges that can be used by subnets",
                                                                                                    "properties": {
                                                                                                        "addressPrefixes": {
                                                                                                            "description": "Gets or sets List of address blocks reserved for this virtual network in CIDR notation",
                                                                                                            "oneOf": [
                                                                                                                {
                                                                                                                    "items": {
                                                                                                                        "type": "string"
                                                                                                                    },
                                                                                                                    "type": "array"
                                                                                                                },
                                                                                                                {
                                                                                                                    "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                                                                                                }
                                                                                                            ]
                                                                                                        }
                                                                                                    },
                                                                                                    "type": "object"
                                                                                                },
                                                                                                {
                                                                                                    "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                                                                                }
                                                                                            ]
                                                                                        },
                                                                                        "vpnClientRevokedCertificates": {
                                                                                            "description": "VpnClientRevokedCertificate for Virtual network gateway.",
                                                                                            "oneOf": [
                                                                                                {
                                                                                                    "items": {
                                                                                                        "description": "VPN client revoked certificate of virtual network gateway",
                                                                                                        "properties": {
                                                                                                            "etag": {
                                                                                                                "description": "A unique read-only string that changes whenever the resource is updated",
                                                                                                                "type": "string"
                                                                                                            },
                                                                                                            "id": {
                                                                                                                "description": "Resource Id",
                                                                                                                "type": "string"
                                                                                                            },
                                                                                                            "name": {
                                                                                                                "description": "Gets name of the resource that is unique within a resource group. This name can be used to access the resource",
                                                                                                                "type": "string"
                                                                                                            },
                                                                                                            "properties": {
                                                                                                                "oneOf": [
                                                                                                                    {
                                                                                                                        "description": "Properties of the revoked VPN client certificate of virtual network gateway",
                                                                                                                        "properties": {
                                                                                                                            "provisioningState": {
                                                                                                                                "description": "Gets or sets Provisioning state of the VPN client revoked certificate resource Updating/Deleting/Failed",
                                                                                                                                "type": "string"
                                                                                                                            },
                                                                                                                            "thumbprint": {
                                                                                                                                "description": "Gets or sets the revoked Vpn client certificate thumbprint",
                                                                                                                                "type": "string"
                                                                                                                            }
                                                                                                                        },
                                                                                                                        "type": "object"
                                                                                                                    },
                                                                                                                    {
                                                                                                                        "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                                                                                                    }
                                                                                                                ]
                                                                                                            }
                                                                                                        },
                                                                                                        "type": "object"
                                                                                                    },
                                                                                                    "type": "array"
                                                                                                },
                                                                                                {
                                                                                                    "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                                                                                }
                                                                                            ]
                                                                                        },
                                                                                        "vpnClientRootCertificates": {
                                                                                            "description": "VpnClientRootCertificate for Virtual network gateway.",
                                                                                            "oneOf": [
                                                                                                {
                                                                                                    "items": {
                                                                                                        "description": "VPN client root certificate of virtual network gateway",
                                                                                                        "properties": {
                                                                                                            "etag": {
                                                                                                                "description": "A unique read-only string that changes whenever the resource is updated",
                                                                                                                "type": "string"
                                                                                                            },
                                                                                                            "id": {
                                                                                                                "description": "Resource Id",
                                                                                                                "type": "string"
                                                                                                            },
                                                                                                            "name": {
                                                                                                                "description": "Gets name of the resource that is unique within a resource group. This name can be used to access the resource",
                                                                                                                "type": "string"
                                                                                                            },
                                                                                                            "properties": {
                                                                                                                "oneOf": [
                                                                                                                    {
                                                                                                                        "description": "Properties of SSL certificates of application gateway",
                                                                                                                        "properties": {
                                                                                                                            "provisioningState": {
                                                                                                                                "description": "Gets or sets Provisioning state of the VPN client root certificate resource Updating/Deleting/Failed",
                                                                                                                                "type": "string"
                                                                                                                            },
                                                                                                                            "publicCertData": {
                                                                                                                                "description": "Gets or sets the certificate public data",
                                                                                                                                "type": "string"
                                                                                                                            }
                                                                                                                        },
                                                                                                                        "type": "object"
                                                                                                                    },
                                                                                                                    {
                                                                                                                        "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                                                                                                    }
                                                                                                                ]
                                                                                                            }
                                                                                                        },
                                                                                                        "type": "object"
                                                                                                    },
                                                                                                    "type": "array"
                                                                                                },
                                                                                                {
                                                                                                    "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                                                                                }
                                                                                            ]
                                                                                        }
                                                                                    },
                                                                                    "type": "object"
                                                                                },
                                                                                {
                                                                                    "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                                                                }
                                                                            ]
                                                                        },
                                                                        "vpnType": {
                                                                            "description": "The type of this virtual network gateway. Possible values include: 'PolicyBased', 'RouteBased'",
                                                                            "oneOf": [
                                                                                {
                                                                                    "enum": [
                                                                                        "PolicyBased",
                                                                                        "RouteBased"
                                                                                    ],
                                                                                    "type": "string"
                                                                                },
                                                                                {
                                                                                    "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                                                                }
                                                                            ]
                                                                        }
                                                                    },
                                                                    "type": "object"
                                                                },
                                                                {
                                                                    "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                                                }
                                                            ]
                                                        },
                                                        "tags": {
                                                            "description": "Resource tags",
                                                            "oneOf": [
                                                                {
                                                                    "additionalProperties": {
                                                                        "type": "string"
                                                                    },
                                                                    "type": "object"
                                                                },
                                                                {
                                                                    "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                                                }
                                                            ]
                                                        }
                                                    },
                                                    "type": "object"
                                                },
                                                {
                                                    "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                                }
                                            ]
                                        },
                                        "virtualNetworkGateway2": {
                                            "oneOf": [
                                                {
                                                    "$ref": "definitions/VirtualNetworkGatewayConnectionPropertiesFormat/properties/virtualNetworkGateway1/oneOf/0"
                                                },
                                                {
                                                    "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                                }
                                            ]
                                        }
                                    },
                                    "type": "object"
                                },
                                {
                                    "$ref": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#/definitions/expression"
                                }
                            ]
                        }
                    },
                    required: [
                        "type",
                        "apiVersion",
                        "properties"
                    ],
                    description: "Microsoft.Network/connections"
                });
        });
    });
});