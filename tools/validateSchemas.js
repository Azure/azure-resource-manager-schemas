"use strict";

const chalk = require("chalk");
const path = require("path");

const utilities = require("./utilities.js");
const validator = require("./validateJSON.js");

if (require.main === module) {
    const schemasFolderPath = utilities.getSchemasFolderPath();

    const schemaFilePaths = utilities.getFiles(schemasFolderPath, function (filePath) {
        let result = false;
        if (filePath.endsWith(".json")) {
            const schemaFileName = path.basename(filePath);
            result = (schemaFileName !== "deploymentParameters.json" &&
                schemaFileName !== "deploymentTemplate.json" &&
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

        if (schemaFilePathIndex > 0) {
            console.log();
        }

        console.log(schemaFilePath);

        const schemaJSON = utilities.readJSONPath(schemaFilePath);

        for (const metaSchema of metaSchemas) {
            const validationResult = validator.validate(schemaJSON, metaSchema.json, schemasFolderPath);

            console.log(`    Using schema: ${metaSchema.path}`);
            if (!validationResult.valid) {
                console.log(chalk.red("        Failed"));
                for (let errorIndex = 0; errorIndex < validationResult.errors.length; ++errorIndex) {
                    const error = validationResult.errors[errorIndex];
                    console.log(chalk.red(`        ${errorIndex + 1}. Error at "${error.dataPath}" - ${error.message}`));
                }
            }
            else {
                console.log(chalk.green("        Passed"));
            }
        }
    }
}


