"use strict";

const chalk = require("chalk");
const path = require("path");

const utilities = require("./utilities.js");
const validator = require("./validateJSON.js");

module.exports.validateSchemas = validateSchemas;
function validateSchemas() {
    const schemasFolderPath = utilities.getSchemasFolderPath();

    const schemaFilePaths = utilities.getFiles(schemasFolderPath, function (filePath) {
        let result = false;
        if (filePath.endsWith(".json")) {
            const schemaFileName = path.basename(filePath);
            result = (schemaFileName !== "deploymentParameters.json" &&
                schemaFileName !== "deploymentTemplate.json" &&
                schemaFileName !== "subscriptionDeploymentParameters.json" &&
                schemaFileName !== "subscriptionDeploymentTemplate.json" &&
                schemaFileName !== "policyDefinition.json" &&
                schemaFileName !== "CreateUIDefinition.CommonControl.json" &&
                schemaFileName !== "CreateUIDefinition.MultiVm.json" &&
                schemaFileName !== "CreateUIDefinition.ProviderControl.json");
        }
        return result;
    });

    const metaSchemaPaths = [
        path.join(__dirname, "ResourceMetaSchema.json"),
        "http://json-schema.org/draft-04/schema"
    ];

    const metaSchemas = [];
    for (const metaSchemaPath of metaSchemaPaths) {
        metaSchemas.push({
            path: metaSchemaPath,
            json: utilities.readJSONPath(metaSchemaPath)
        });
    }

    for (let schemaFilePathIndex = 0; schemaFilePathIndex < schemaFilePaths.length; ++schemaFilePathIndex) {
        var schemaFilePath = schemaFilePaths[schemaFilePathIndex];

        const schemaJSON = utilities.readJSONPath(schemaFilePath);

        for (const metaSchema of metaSchemas) {
            const validationResult = validator.validate(schemaJSON, metaSchema.json, schemasFolderPath);

            if (!validationResult.valid) {
                let errorMessage = "\n        Failed";
                
                for (let errorIndex = 0; errorIndex < validationResult.errors.length; ++errorIndex) {
                    const error = validationResult.errors[errorIndex];
                    errorMessage += `\n        ${errorIndex + 1}. Error at "${error.dataPath}" - ${error.message}`;
                }

                return {
                   valid: validationResult.valid,
                   schemaFilePath: schemaFilePath,
                   metaSchema: metaSchema.path,
                   message: errorMessage
                };
            }
        }
    }

    return { valid: true };
}

let validationResult = validateSchemas();
if (require.main == module) {
    if (!validationResult.valid) {
        console.log(chalk.red("validation error:"));
        console.log(chalk.red(validationResult.schemaFilePath));
        console.log(chalk.red(`Using schema: ${validationResult.metaSchema}`));
        console.log(chalk.red(validationResult.message));
    }
    else {
        console.log(chalk.green("All Passed"));
    }
}