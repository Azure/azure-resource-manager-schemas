var path = require("path");

var assert = require("./assert.js");
var test = require("./test.js");
var utilities = require("./utilities.js");
var validator = require("./validateJSON.js");

var schemasFolderPath = utilities.getSchemasFolderPath();

var testsFolderPath = utilities.getTestsFolderPath();
var testFiles = [];
utilities.forEachFile(testsFolderPath, function (filePath) {
    if (filePath.endsWith(".tests.json")) {
        testFiles.push(filePath);
    }
});

for(var testFileIndex in testFiles)
{
    var testFilePath = testFiles[testFileIndex];
    console.log("Running test file \"" + testFilePath + "\"");
    
    var testFileJSON = utilities.readJSONFile(testFilePath);
    
    for (var testIndex in testFileJSON.tests)
    {
        var testObject = testFileJSON.tests[testIndex];
        console.log("\tRunning test \"" + testObject.name + "\"");

        test.run(function()
        {
            // Get the definition schema JSON
            var definitionSchemaLocation = testObject.definition;
            var definitionSchemaLocationHashIndex = definitionSchemaLocation.indexOf("#");
            
            var definitionSchemaJSON;
            if (definitionSchemaLocationHashIndex === -1 || definitionSchemaLocationHashIndex === definitionSchemaLocation.length - 1)
            {
                definitionSchemaJSON = utilities.readJSONPath(definitionSchemaLocation, schemasFolderPath);
            }
            else
            {
                var definitionSchemaUri = definitionSchemaLocation.substring(0, definitionSchemaLocationHashIndex);
                var definitionSchemaJSON = utilities.readJSONPath(definitionSchemaUri, schemasFolderPath);

                var definitionSchemaPath = definitionSchemaLocation.substring(definitionSchemaLocationHashIndex + 1);
                if (definitionSchemaPath.startsWith("/")) {
                    definitionSchemaPath = definitionSchemaPath.substring(1);
                }
                var definitionSchemaPathParts = definitionSchemaPath.split("/");
                for (var definitionSchemaPathPartIndex in definitionSchemaPathParts) {
                    var definitionSchemaPathPart = definitionSchemaPathParts[definitionSchemaPathPartIndex];
                    definitionSchemaJSON = definitionSchemaJSON[definitionSchemaPathPart];

                    if (!definitionSchemaJSON) {
                        assert.Fail("Could not find the resource \"" + definitionSchemaPath + "\" in schema \"" + definitionSchemaUri + "\"");
                    }
                }
            }
            
            var result = validator.validate(testObject.json, definitionSchemaJSON, schemasFolderPath);
            var expectedValid = !testObject.errors;
            assert.Equal(expectedValid, result.valid, "Test \"" + testObject.name + "\" should " + (expectedValid ? "" : "not ") + "have been valid, but it was" + (result.valid ? "." : " not: " + JSON.stringify(result)));
            
            var testErrorPrefix = "Test \"" + testObject.name + "\" - ";
            if (expectedValid)
            {
                assert.Empty(result.errors, testErrorPrefix + "No errors were expected, but validation returned the following error" + (result.errors.length === 1 ? "" : "s") + ": " + JSON.stringify(result.errors));
            }
            else
            {
                assert.Equal(testObject.errors.length, result.errors.length, testErrorPrefix + "The lengths of " + JSON.stringify(testObject.errors) + " and " + JSON.stringify(result.errors) + " were not equal.");
                for (var errorIndex in testObject.errors) {
                    var testObjectError = testObject.errors[errorIndex];
                    var resultError = result.errors[errorIndex];

                    for (var propertyName in testObjectError) {
                        assert.Equal(testObjectError[propertyName], resultError[propertyName], testErrorPrefix + "The error property \"" + propertyName + "\" should have been \"" + testObjectError[propertyName] + "\", but was \"" + resultError[propertyName] + "\".");
                    }
                }
            }
        });
    }
}

test.showResults();