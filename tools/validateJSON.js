"use strict";

const assert = require("assert");
const fs = require("fs");
const tv4 = require("tv4");

const utilities = require("./utilities");

function logError(message) {
    console.log(`ERROR: ${message}`);
}

function logUsage() {
    console.log(`USAGE: "node validateJSON.js <path-to-json-file> <path-to-schema-file> [<path-to-schema-folder>]"`);
}

function getCommandLineArgument(commandLineArgumentIndex, errorMessage) {
    const commandLineArgument = process.argv[commandLineArgumentIndex];
    if (!commandLineArgument && errorMessage) {
        logError(errorMessage);
        logUsage();
        process.exit(-1);
    }
    else {
        return commandLineArgument;
    }
}

function getFileContents(filePath) {
    try {
        return fs.readFileSync(filePath, "utf8");
    }
    catch (error) {
        if (error.code === "ENOENT") {
            logError("Could not find file: \"" + error.path + "\"");
        }
        else {
            logError("Unrecognized error: " + error);
        }
        process.exit(-1);
    }
}

function getErrorMessage(prefix, value, suffix) {
    let errorMessage = prefix;
    if (value === undefined) {
        errorMessage += "n";
    }
    else if (value === "") {
        errorMessage += "n empty";
    }

    if (value !== "") {
        errorMessage += " " + value;
    }
    errorMessage += " " + suffix;

    return errorMessage;
}

module.exports.validate = validate;
/**
 * Validates the provided JSON object against the provided schema.
 * @param {any} json
 * @param {any} schema
 * @param {string} schemaFolderPath
 * @return {any}
 */
function validate(json, schema, schemaFolderPath) {
    let result;

    if (json === null || json === undefined) {
        logError(getErrorMessage("Cannot validate a", json, "json object."));
        result = { valid: false, errors: [{ message: "Invalid JSON" }], missingSchemas: [] };
    }
    else if (!schema) {
        logError(getErrorMessage("Cannot use a", schema, "schema for validation."));
        result = { valid: false, errors: [{ message: "Invalid schema" }], missingSchemas: [] };
    }
    else {
        tv4.addSchema(json);
        tv4.addSchema(schema);
       console.log("%s %s %s", json, schema, schemaFolderPath);
        addMissingSchemas(tv4.getMissingUris(), schemaFolderPath);
        result = convertTv4ValidationResult(tv4.validateMultiple(json, schema));

        while (result.missingSchemas && result.missingSchemas.length > 0) {
            addMissingSchemas(result.missingSchemas, schemaFolderPath);
            result = convertTv4ValidationResult(tv4.validateMultiple(json, schema));
        }
    }

    return result;
}

function convertTv4ValidationResult(tv4ValidationResult) {
    const result = {
        valid: tv4ValidationResult.valid,
        errors: [],
        missingSchemas: []
    };

    for (const missingSchema of tv4ValidationResult.missing) {
        assert.notDeepStrictEqual(missingSchema, "", "tv4ValidationResult should not have had any empty missing schemas: " + utilities.toString(tv4ValidationResult.missing));

        result.missingSchemas.push(missingSchema);
    }

    for (const error of tv4ValidationResult.errors) {
        result.errors.push(cleanValidationErrorProperties(error));
    }

    return result;
}

function cleanValidationErrorProperties(tv4ValidationError) {
    const result = {};
    if (tv4ValidationError) {
        result.message = tv4ValidationError.message;
        result.dataPath = tv4ValidationError.dataPath ? tv4ValidationError.dataPath : "/";
        result.schemaPath = tv4ValidationError.schemaPath;
        
        if (tv4ValidationError.subErrors) {
            result.subErrors = [];
            
            for (const subError of tv4ValidationError.subErrors) {
                result.subErrors.push(cleanValidationErrorProperties(subError));
            }
        }
    }
    return result;
}

/**
 * @param {string[]} missingUris
 * @param {string} schemaFolderPath
 */
function addMissingSchemas(missingUris, schemaFolderPath) {
    while (missingUris && missingUris.length > 0) {
        var missingUri = missingUris.pop();
       console.log(missingUri);
        if (missingUri && missingUri.length > 0 && missingUri != 'https://schema.management.azure.com/schemas/2017-10-01/microsoft.insights.json' && missingUri != 'https://schema.management.azure.com/schemas/2016-03-01/microsoft.insights.json') {
            tv4.addSchema(missingUri, utilities.readJSONPath(missingUri, schemaFolderPath));

            missingUris = tv4.getMissingUris();
        }
    }
}

module.exports.validateFile = validateFile;
/**
 * @param {string} jsonFilePath
 * @param {string} schemaFilePath
 * @param {string} schemaFolderPath
 */
function validateFile(jsonFilePath, schemaFilePath, schemaFolderPath) {
    const json = utilities.readJSONPath(jsonFilePath);
    const schemaJson = utilities.readJSONPath(schemaFilePath);

    return validate(json, schemaJson, schemaFolderPath);
}

if (require.main === module) {
    // commandLineArguments[0] is node.exe
    // commandLineArguments[1] is validateJSON.js
    const jsonFilePath = getCommandLineArgument(2, "The first argument must be the path to the json file to validate.");
    const schemaFilePath = getCommandLineArgument(3, "The second argument must be the path to the schema file to use for validation.");
    const missingSchemaFolderPath = getCommandLineArgument(4);

    const validationResult = validateFile(jsonFilePath, schemaFilePath, missingSchemaFolderPath);
    if (validationResult && validationResult.valid) {
        console.log("JSON validation passed");
    }
    else {
        console.log("JSON validation failed");
        for (let errorIndex = 0; errorIndex < validationResult.errors.length; ++errorIndex) {
            if (errorIndex > 0) {
                console.log();
            }

            const error = validationResult.errors[errorIndex];

            console.log(`Error ${errorIndex}:`);
            console.log(`  Message:   "${error.message}"`);
            console.log(`  Data Path: "${error.dataPath}"`);
        }
    }
}
