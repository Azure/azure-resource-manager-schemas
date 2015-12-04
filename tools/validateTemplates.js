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

var singleIndent = utilities.repeat(" ", 4);

for(var testFileIndex in testFiles)
{
    var testFilePath = testFiles[testFileIndex];
    console.log("Running test file \"" + testFilePath + "\"");
    
    var testFileJSON = utilities.readJSONFile(testFilePath);
    
    for (var testIndex in testFileJSON.tests)
    {
        var testObject = testFileJSON.tests[testIndex];
        console.log(singleIndent + "Running test \"" + testObject.name + "\"");

        test.run(function()
        {
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
                definitionSchemaJSON = utilities.readJSONPath(definitionSchemaUri, schemasFolderPath);

                var definitionSchemaPath = definitionSchemaLocation.substring(definitionSchemaLocationHashIndex + 1);
                if (definitionSchemaPath.startsWith("/")) {
                    definitionSchemaPath = definitionSchemaPath.substring(1);
                }
                var definitionSchemaPathParts = definitionSchemaPath.split("/");
                for (var definitionSchemaPathPartIndex in definitionSchemaPathParts) {
                    var definitionSchemaPathPart = definitionSchemaPathParts[definitionSchemaPathPartIndex];
                    definitionSchemaJSON = definitionSchemaJSON[definitionSchemaPathPart];

                    if (!definitionSchemaJSON) {
                        assert.Fail("Could not find definition \"" + definitionSchemaPath + "\" in schema \"" + definitionSchemaUri + "\"");
                    }
                }
            }
            
            var result = validator.validate(testObject.json, definitionSchemaJSON, schemasFolderPath);
            
            var testErrorPrefix = "Test \"" + testObject.name + "\" ";
            if (!testObject.expectedErrors || testObject.expectedErrors.length === 0)
            {
                assert.Empty(result.errors, testErrorPrefix + "had no expected errors, but the validation result contained errors.");
            }
            else
            {
                if(testObject.expectedErrors.length !== result.errors.length)
                {
                    var errorMessage = "There were a different number of expected errors (" + testObject.expectedErrors.length + ") than there were actual errors (" + result.errors.length + ")";
                    assert.Fail(assert.ExpectedActualString(testObject.expectedErrors, result.errors, errorMessage));
                }
                else
                {
                    for(var errorIndex = 0; errorIndex < testObject.expectedErrors.length; ++errorIndex)
                    {
                        var expectedError = testObject.expectedErrors[errorIndex];
                        var resultError = result.errors[errorIndex];
                        
                        assert.Equal(expectedError.message, resultError.message, "The error message for error " + (errorIndex + 1) + " was not the expected error.");
                        assert.Equal(expectedError.dataPath, resultError.dataPath, "The error dataPath for error " + (errorIndex + 1) + " was not the expected dataPath.");
                    }
                }
            }
        });
    }
}

test.showResults();