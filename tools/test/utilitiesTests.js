"use strict";

const assert = require("assert");
const path = require("path");

const utilities = require("../utilities");

suite("utilities", () => {
    suite("findFileOrFolder(string,string?)", () => {
        test("with folder name that doesn't exist", () => {
            assert.deepStrictEqual(utilities.findFileOrFolder("IDon'tExist"), null);
        });
    });

    test("forEachFile(string,callback)", () => {
        let fileCount = 0;
        utilities.forEachFile(__dirname, (filePath) => { ++fileCount; });
        assert(fileCount >= 1);
    });
    
    test("getSchemasFolderPath()", () => {
        const schemasFolderPath = utilities.getSchemasFolderPath();
        assert(schemasFolderPath);
        assert(schemasFolderPath.endsWith("schemas"), `schemasFolderPath (${schemasFolderPath}) should've ended with "schemas".`);
    });
    
    suite("pathExists(string)", () => {
        test("with null", () => {
            assert.throws(() => { utilities.pathExists(null); });
        });

        test("with undefined", () => {
            assert.throws(() => { utilities.pathExists(undefined); });
        });

        test("with empty", () => {
            assert.throws(() => { utilities.pathExists(""); });
        });

        test("with non-existing file", () => {
            assert(!utilities.pathExists("IDon'tExist.txt"));
        });

        test("with existing file", () => {
            assert(utilities.pathExists(__filename));
        });

        test("with existing folder", () => {
            assert(utilities.pathExists(__dirname));
        });
    });

    suite("stripUTF8BOM(string)", () => {
        test("with null", () => {
            assert.deepStrictEqual(utilities.stripUTF8BOM(null), null);
        });

        test("with undefined", () => {
            assert.deepStrictEqual(utilities.stripUTF8BOM(undefined), undefined);
        });

        test("with empty", () => {
            assert.deepStrictEqual(utilities.stripUTF8BOM(""), "");
        });

        test("with no BOM", () => {
            assert.deepStrictEqual(utilities.stripUTF8BOM("hello"), "hello");
        });

        test("with BOM", () => {
            assert.deepStrictEqual(utilities.stripUTF8BOM("\uFEFF" + "hello"), "hello");
        });
    });

    suite("readJSONPath(string, string)", () => {
        test("with null path", () => {
            assert.throws(() => { utilities.readJSONPath(null); });
        });

        test("with undefined path", () => {
            assert.throws(() => { utilities.readJSONPath(undefined); });
        });

        test("with empty path", () => {
            assert.throws(() => { utilities.readJSONPath(""); });
        });

        test("with non-existing file", () => {
            assert.throws(() => { utilities.readJSONPath("IDon'tExist.json"); });
        });

        test("with non-json file", () => {
            assert.throws(() => { utilities.readJSONPath(__filename); });
        });

        test("with json file", () => {
            const result = utilities.readJSONPath("../schemas/2014-02-26/microsoft.visualstudio.json");
            assert(result);
            assert.deepStrictEqual(typeof result, "object");
        });

        test("with non-json http uri", () => {
            assert.throws(() => { utilities.readJSONPath("http://www.bing.com"); });
        });

        test("with non-json https uri", () => {
            assert.throws(() => { utilities.readJSONPath("https://www.bing.com"); });
        });

        test("with json http uri", () => {
            const result = utilities.readJSONPath("http://json-schema.org/schema");
            assert(result);
            assert.deepStrictEqual(typeof result, "object");
        });

        test("with schema folder path and matching uri", () => {
            const result = utilities.readJSONPath("https://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#", "../schemas");
            assert(result);
            assert.deepStrictEqual(typeof result, "object");
        });

        test("with schema folder path and matching uri", () => {
            const result = utilities.readJSONPath("https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#", "../schemas");
            assert(result);
            assert.deepStrictEqual(typeof result, "object");
        });
    });
    
    suite("toString(any, string?)", () => {
        test("with null value", () => {
            assert.deepStrictEqual(utilities.toString(null), "null");
        });
        
        test("with null value with indent", () => {
            assert.deepStrictEqual(utilities.toString(null, "   "), "null");
        });
        
        test("with undefined value", () => {
            assert.deepStrictEqual(utilities.toString(undefined), "undefined");
        });
        
        test("with undefined value with indent", () => {
            assert.deepStrictEqual(utilities.toString(undefined, "   "), "undefined");
        });
        
        test("with boolean value", () => {
            assert.deepStrictEqual(utilities.toString(true), "true");
        });
        
        test("with boolean value with indent", () => {
            assert.deepStrictEqual(utilities.toString(false, "   "), "false");
        });
        
        test("with empty array", () => {
            assert.deepStrictEqual(utilities.toString([]), "[\n]");
        });
        
        test("with empty array with indent", () => {
            assert.deepStrictEqual(utilities.toString([], "  "), "  [\n  ]");
        });
        
        test("with single element array", () => {
            assert.deepStrictEqual(utilities.toString(["a"]), `[\n  "a"\n]`);
        });
        
        test("with two element array", () => {
            assert.deepStrictEqual(utilities.toString(["a", 12]), `[\n  "a",\n  12\n]`);
        });
        
        test("with two element array with indent", () => {
            assert.deepStrictEqual(utilities.toString(["a", 12], "   "), `   [\n     "a",\n     12\n   ]`);
        });
        
        test("with empty object", () => {
            assert.deepStrictEqual(utilities.toString({}), `{\n}`);
        });
        
        test("with single property object", () => {
            assert.deepStrictEqual(utilities.toString({ a: 1 }), `{\n  "a": 1\n}`);
        });
        
        test("with two property object", () => {
            assert.deepStrictEqual(utilities.toString({ a: 1, b: "2" }), `{\n  "a": 1,\n  "b": "2"\n}`);
        });
    });
});