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

        test("with $ref inside of a oneOf property", () => {
            const fullJsonSchema = {
                a: {
                    b: {
                        c: {
                            oneOf: [
                                {
                                    value: 20
                                },
                                {
                                    $ref: "#/a/b"
                                }
                            ]
                        }
                    }
                }
            };
            assert.deepStrictEqual(
                runSchemaTests.resolveSchemaLocalReferences(fullJsonSchema.a, fullJsonSchema),
                {
                    b: {
                        c: {
                            oneOf: [
                                {
                                    value: 20
                                },
                                {
                                    c: {
                                        oneOf: [
                                            {
                                                value: 20
                                            },
                                            {
                                                $ref: "#/b/c/oneOf/1"
                                            }
                                        ]
                                    }
                                }
                            ]
                        }
                    }
                });
        });

        test("with diamond references", () => {
            const fullSchemaJson = {
                a: {
                    $ref: "#/c/d"
                },
                c: {
                    d: {
                        f: {
                            $ref: "#/c/i"
                        },
                        h: {
                            $ref: "#/c/i"
                        }
                    },
                    i: {
                    }
                }
            };

            assert.deepStrictEqual(
                runSchemaTests.resolveSchemaLocalReferences(fullSchemaJson.a, fullSchemaJson),
                {
                    f: {
                    },
                    h: {
                        $ref: "#/f"
                    }
                });
        });
    });
});