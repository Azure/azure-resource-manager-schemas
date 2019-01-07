"use strict";

const assert = require("assert");
const chalk = require("chalk");
const fs = require("fs");
const path = require("path");

const utilities = require("./utilities");
const validator = require("./validateJSON");

module.exports.getProperty = getProperty;
/**
 * Get the property at the provided propertyPath for the provided jsonValue. An error will be thrown
 * if a property at the provided path doesn't exist.
 * @param propertyPath {String} The path (i.e. - a/b/c) to the property.
 * @param jsonValue {any} The value to get the property from.
 */
function getProperty(propertyPath, jsonValue) {
    let result = jsonValue;

    const propertyNamesInPath = propertyPath.split("/");
    for (const propertyName of propertyNamesInPath) {
        result = result[propertyName];

        if (result === undefined) {
            assert.fail(`Could not find definition "${propertyPath}".`);
        }
    }

    return result;
}

module.exports.getTestFiles = getTestFiles;
/**
 * Get the test files to run.
 * @returns {String[]}
 */
function getTestFiles() {
    /** @type {String[]} */
    let customTestFolder = null;
    for (let i = 1; i < process.argv.length - 1; i++){
        if (process.argv[i] === "--dir") {
            customTestFolder = process.argv[i + 1];
        }
    }

    let testsFolderPath = utilities.findFileOrFolder("tests")
    if (customTestFolder) {
        if (customTestFolder.startsWith("../") || customTestFolder.startsWith("..\\")) {
            customTestFolder = customTestFolder.substring(3);
        }
        testsFolderPath = utilities.findFileOrFolder(customTestFolder);

        if (!testsFolderPath) {
            console.log(chalk.red("Path not found: " + process.argv[2]));
            return "";
        }
    }

    const testFiles = utilities.getFiles(testsFolderPath, function (filePath) { return filePath.endsWith(".tests.json"); });
    if (!customTestFolder) {
        testFiles.push(utilities.findFileOrFolder("ResourceMetaSchema.tests.json"));
    }
    return testFiles;
}

module.exports.resolveSchemaLocalReferences = resolveSchemaLocalReferences;
/**
 * Recursively resolve any $ref properties that point to properties inside of fullSchemaJson.
 * @param {any} partialSchemaJson The subsection of fullSchemaJson to resolve.
 * @param {any} fullSchemaJson The supersection of partialSchemaJson that partialSchemaJson will be
 *      resolved against.
 * @param {String} [currentPath="#"] The current path of the resolution process.
 * @param {Object} [resolvedPaths={}] The current set of paths that have been resolved.
 */
function resolveSchemaLocalReferences(partialSchemaJson, fullSchemaJson, currentPath, resolvedPaths) {
    let result = partialSchemaJson;

    if (partialSchemaJson !== fullSchemaJson &&
        partialSchemaJson && typeof partialSchemaJson === "object" &&
        fullSchemaJson && typeof fullSchemaJson === "object") {

        if (Array.isArray(partialSchemaJson)) {
            result = [];
        }
        else {
            assert.deepStrictEqual(typeof partialSchemaJson, "object");
            result = {};
        }

        if (currentPath === undefined) {
            currentPath = "#";
        }

        if (resolvedPaths === undefined) {
            resolvedPaths = {};
        }

        for (const propertyName in partialSchemaJson) {
            const propertyValue = partialSchemaJson[propertyName];
            const propertyPath = currentPath + "/" + propertyName;

            if (propertyName === "$ref" && typeof propertyValue === "string" && propertyValue.startsWith("#/")) {
                // assert.deepStrictEqual(Object.keys(partialSchemaJson).length, 1, `A JSON object that contains a $ref property (${propertyValue}) shouldn't have any other properties (${JSON.stringify(Object.keys(partialSchemaJson))}).`);

                if (propertyValue in resolvedPaths) {
                    result[propertyName] = resolvedPaths[propertyValue];
                }
                else {
                    assert.deepStrictEqual(propertyValue.substring(0, 2), "#/");
                    resolvedPaths[propertyValue] = currentPath;

                    const propertyPath = propertyValue.substring(2); // Skip the initial "#/"
                    const referencedProperty = getProperty(propertyPath, fullSchemaJson);
                    result = resolveSchemaLocalReferences(referencedProperty, fullSchemaJson, currentPath, resolvedPaths);
                }
            }
            else {
                result[propertyName] = resolveSchemaLocalReferences(propertyValue, fullSchemaJson, propertyPath, resolvedPaths);
            }
        }
    }

    return result;
}

module.exports.getDefinitionSchemaJSON = getDefinitionSchemaJSON;
/**
 * Get the JSON schema at the provided definitionSchemaPath.
 * @param {string} definitionSchemaPath The path to the definition schema. This should be a uri.
 * @param {string} [schemasFolderPath] The path to the local copy of the schemas repository.
 * @returns {Object} The definition schema JSON object.
 */
function getDefinitionSchemaJSON(definitionSchemaPath, schemasFolderPath) {
    const locationHashIndex = definitionSchemaPath.indexOf("#");

    let definitionSchemaJSON = utilities.readJSONPath(definitionSchemaPath, schemasFolderPath);
    if (0 <= locationHashIndex && locationHashIndex < definitionSchemaPath.length - 1) {
        const definitionSchemaFullJSON = definitionSchemaJSON;

        definitionSchemaPath = definitionSchemaPath.substring(locationHashIndex + 1);
        if (definitionSchemaPath.startsWith("/")) {
            definitionSchemaPath = definitionSchemaPath.substring(1);
        }

        definitionSchemaJSON = getProperty(definitionSchemaPath, definitionSchemaFullJSON);
        definitionSchemaJSON = resolveSchemaLocalReferences(definitionSchemaJSON, definitionSchemaFullJSON);
    }

    return definitionSchemaJSON;
}

module.exports.assertErrors = assertErrors;
/**
 * Compare the expected and actual errors.
 * @param {error[]} expectedErrors List of expected errors.
 * @param {error[]} actualErrors List of actual errors.
 * @param {bool} assertSubErrors True if we want to assert subErrors.
 * @param {string} errorPrefix This is the prefix before error number in messages. If recursive then each level will add to this string.
 * @returns nothing.
 */
function assertErrors(expectedErrors, actualErrors, assertSubErrors, errorPrefix) {
    if (!expectedErrors || expectedErrors.length === 0) {
        assert.deepStrictEqual(actualErrors, [], `There were no expected errors, but the validation result contained errors.`);
    }
    else {
        if (expectedErrors.length !== actualErrors.length) {
            const errorMessage = `There were a different number of expected errors (${expectedErrors.length}) than there were actual errors (${actualErrors.length})`;
            assert.deepStrictEqual(actualErrors, expectedErrors, errorMessage);
        }
        else {
            for (let errorIndex = 0; errorIndex < expectedErrors.length; ++errorIndex) {
                const expectedError = expectedErrors[errorIndex];
                const actualError = actualErrors[errorIndex];

                const errorNumber = errorPrefix + (errorIndex + 1).toString();
                assert.deepStrictEqual(actualError.message, expectedError.message, `The error message for error ${errorNumber} was not the expected error.`);
                assert.deepStrictEqual(actualError.dataPath, expectedError.dataPath, `The error dataPath for error ${errorNumber} was not the expected dataPath.`);

                // Assert sub errors if the -AssertSubErrors parameter is used and there are expected sub errors
                if (assertSubErrors && expectedError.subErrors && expectedError.subErrors.length > 0) {
                    assertErrors(expectedError.subErrors, actualError.subErrors, assertSubErrors, errorNumber + ".");
                }
            }
        }
    }
}

module.exports.runSchemaTests = runSchemaTests;

function runSchemaTests() {
    let testResult = {
        testsPassed: 0,
        testsFailed: 0,
        testcases: []
    };

    let assertSubErrors = false;
    for (let i = 1; i < process.argv.length; i++){
        if (process.argv[i] === "--AssertSubErrors") {
            assertSubErrors = true;
        }
    }

    const schemasFolderPath = utilities.getSchemasFolderPath();
    assert(schemasFolderPath, "Could not find a 'schemas' folder.");

    for (const testFilePath of getTestFiles()) {

        const testFile = utilities.readJSONPath(testFilePath);

        for (const test of testFile.tests) {

            try {
                const definitionSchemaJSON = getDefinitionSchemaJSON(test.definition, schemasFolderPath);

                const result = validator.validate(test.json, definitionSchemaJSON, schemasFolderPath);

                assertErrors(test.expectedErrors, result.errors, assertSubErrors, "");

                testResult.testcases.push({
                    valid: true,
                    testFile: testFilePath,
                    testName: test.name
                });
                ++testResult.testsPassed;
            }
            catch (error) {
                

                let message = "";

                if (error.expected) {
                    if (error.message) {
                        message += `Message: ${error.message}`;
                    }
                    message += `\nExpected: ${utilities.toString(error.expected)}`;
                    if (error.actual) {
                        message += `\nActual: ${utilities.toString(error.actual)}`;
                    }
                }
                else {
                    if (error.actual) {
                        message += `Message: ${error.actual}`;
                    } 
                    else {
                        message += `Message: ${error}`;
                    }
                }

                testResult.testcases.push({
                    valid: false,
                    testFile: testFilePath,
                    testName: test.name,
                    message: message
                });

                ++testResult.testsFailed;
            }
        }
    }

    return testResult;
}

let testResult = runSchemaTests();

if (require.main == module) {
    for (const testcase of testResult.testcases) {
        if (!testcase.valid) {
            console.log(chalk.red(""));
            console.log(chalk.red(`test file: ${testcase.testFile}`));
            console.log(chalk.red(`test name: ${testcase.testName}`));
            console.log(chalk.red(testcase.message));
        }
    };
    
    console.log();
    console.log(`${testResult.testsPassed} tests passed`);
    console.log(`${testResult.testsFailed} tests failed`);
}