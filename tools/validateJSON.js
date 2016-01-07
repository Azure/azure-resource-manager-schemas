var tv4 = require("tv4");

var assert = require("./assert.js");
var utilities = require("./utilities.js");

module.exports.logger = console.log;

function log(message) {
  if (module.exports.logger !== null) {
    module.exports.logger(message);
  }
}

function logError(message) {
  log("ERROR: " + message);
}

function logUsage() {
  log("USAGE: \"node validateJSON.js <path-to-json-file> <path-to-schema-file> [<path-to-schema-folder>]\"");
}

function exit(exitCode) {
  process.exit(exitCode);
}

function getCommandLineArgument(commandLineArgumentIndex, errorMessage) {
  var commandLineArgument = process.argv[commandLineArgumentIndex];
  if (!commandLineArgument && errorMessage) {
    logError(errorMessage);
    logUsage();
    exit(-1);
  }
  else {
    return commandLineArgument;
  }
}

function getFileContents(filePath) {
  var fs = require("fs");
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
    exit(-1);
  }
}

function getErrorMessage(prefix, value, suffix) {
  var errorMessage = prefix;
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

/**
 * Validates the provided JSON object against the provided schema.
 * @param {Object} json
 * @param {Object} schema
 * @return {Object}
 */
module.exports.validate = validate;
function validate(json, schema, missingSchemaFolderPath) {
  if (json === null ||
    json === undefined) {
    logError(getErrorMessage("Cannot validate a", json, "json object."));
    return { valid: false, errors: [{ message: "Invalid JSON" }], missingSchemas: [] };
  }
  else if (!schema) {
    logError(getErrorMessage("Cannot use a", schema, "schema for validation."));
    return { valid: false, errors: [{ message: "Invalid schema" }], missingSchemas: [] };
  }
  else {
    tv4.addSchema(json);
    tv4.addSchema(schema);
    addMissingSchemas(tv4.getMissingUris(), missingSchemaFolderPath);

    var result = convertTv4ValidationResult(tv4.validateMultiple(json, schema));
    while (result.missingSchemas && result.missingSchemas.length > 0) {
      addMissingSchemas(result.missingSchemas, missingSchemaFolderPath);
      result = convertTv4ValidationResult(tv4.validateMultiple(json, schema));
    }

    return result;
  }
}

function convertTv4ValidationResult(tv4ValidationResult) {
  var result = { valid: tv4ValidationResult.valid, errors: [], missingSchemas: [] };

  for (var missingSchemaIndex in tv4ValidationResult.missing) {
    var missingSchema = tv4ValidationResult.missing[missingSchemaIndex];
    assert.NotEmpty(missingSchema, "tv4ValidationResult should not have had any empty missing schemas: " + utilities.toString(tv4ValidationResult.missing));

    result.missingSchemas.push(missingSchema);
  }

  for (var errorIndex in tv4ValidationResult.errors) {
    var currentError = tv4ValidationResult.errors[errorIndex];
    var resultError =
      {
        message: currentError.message,
        dataPath: currentError.dataPath,
        schemaPath: currentError.schemaPath,
      };
    if (!resultError.dataPath) {
      resultError.dataPath = "/";
    }

    result.errors.push(resultError);
  }

  return result;
}

function addMissingSchemas(missingUris, missingSchemaFolderPath) {
  while (missingUris && missingUris.length > 0) {
    var missingUri = missingUris.pop();
    if (missingUri && missingUri.length > 0) {
      tv4.addSchema(missingUri, utilities.readJSONPath(missingUri, missingSchemaFolderPath));

      missingUris = tv4.getMissingUris();
    }
  }
}

module.exports.validateFile = validateFile;
function validateFile(jsonFilePath, schemaFilePath, missingSchemaFolderPath) {
  var json = utilities.readJSONFile(jsonFilePath);
  var schemaJson = utilities.readJSONFile(schemaFilePath);

  return validate(json, schemaJson, missingSchemaFolderPath);
}

if (require.main === module) {
  // commandLineArguments[0] is node.exe
  // commandLineArguments[1] is validateJSON.js
  var jsonFilePath = getCommandLineArgument(2, "The first argument must be the path to the json file to validate.");
  var schemaFilePath = getCommandLineArgument(3, "The second argument must be the path to the schema file to use for validation.");
  var missingSchemaFolderPath = getCommandLineArgument(4);

  var validationResult = validateFile(jsonFilePath, schemaFilePath, missingSchemaFolderPath);
  if (validationResult && validationResult.valid) {
    log("JSON validation passed");
  }
  else {
    log("JSON validation failed");
    for (var errorIndex in validationResult.errors) {
      if (errorIndex > 0) {
        log();
      }

      log("Error " + errorIndex + ":");
      log("  Message:   \"" + validationResult.errors[errorIndex].message + "\"");
      log("  Data Path: " + validationResult.errors[errorIndex].dataPath);
    }
  }
}