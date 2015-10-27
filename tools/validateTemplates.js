var path = require("path");

var assert = require("./assert.js");
var test = require("./test.js");
var utilities = require("./utilities.js");
var validator = require("./validateJSON.js");

function getTestFiles()
{
    var testsFolderPath = utilities.getTestsFolderPath();
    
    var testFiles = [];
    
    utilities.forEachFile(testsFolderPath, function(filePath)
    {
       if(filePath.endsWith(".tests.json"))
       {
           testFiles.push(filePath);
       } 
    });
    
    return testFiles;
}

var schemasFolderPath = utilities.getSchemasFolderPath();

var testFiles = getTestFiles();
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
            var resourceSchemaLocation = testObject.resource;
            var resourceSchemaLocationHashIndex = resourceSchemaLocation.indexOf("#");
            
            var resourceSchemaJSON;
            if (resourceSchemaLocationHashIndex === -1 || resourceSchemaLocationHashIndex === resourceSchemaLocation.length - 1)
            {
                resourceSchemaJSON = utilities.readJSONPath(resourceSchemaLocation, schemasFolderPath);
            }
            else
            {
                var resourceSchemaUri = resourceSchemaLocation.substring(0, resourceSchemaLocationHashIndex);
                var resourceSchemaJSON = utilities.readJSONPath(resourceSchemaUri, schemasFolderPath);

                var resourceSchemaPath = resourceSchemaLocation.substring(resourceSchemaLocationHashIndex + 1);
                if (resourceSchemaPath.startsWith("/")) {
                    resourceSchemaPath = resourceSchemaPath.substring(1);
                }
                var resourceSchemaPathParts = resourceSchemaPath.split("/");
                for (var resourceSchemaPathPartIndex in resourceSchemaPathParts) {
                    var resourceSchemaPathPart = resourceSchemaPathParts[resourceSchemaPathPartIndex];
                    resourceSchemaJSON = resourceSchemaJSON[resourceSchemaPathPart];

                    if (!resourceSchemaJSON) {
                        assert.Fail("Could not find the resource \"" + resourceSchemaPath + "\" in schema \"" + resourceSchemaUri + "\"");
                    }
                }
            }    

            var result = validator.validate(testObject.json, resourceSchemaJSON, schemasFolderPath);
            assert.Equal(testObject.valid, result.valid, "Test \"" + testObject.name + "\" should " + (testObject.valid ? "" : "not ") + "have been valid, but it was" + (result.valid ? "." : " not: " + JSON.stringify(result)));
            
            if (!testObject.errors)
            {
                assert.Empty(result.errors, "Test \"" + testObject.name + "\" - No errors were expected, but found: " + JSON.stringify(testObject.errors) + " and " + JSON.stringify(result.errors));
            }
            else
            {
                assert.Equal(testObject.errors.length, result.errors.length, "Test \"" + testObject.name + "\" - The lengths of " + JSON.stringify(testObject.errors) + " and " + JSON.stringify(result.errors) + " were not equal.");
                for (var errorIndex in testObject.errors) {
                    var testObjectError = testObject.errors[errorIndex];
                    var resultError = result.errors[errorIndex];

                    for (var propertyName in testObjectError) {
                        assert.Equal(testObjectError[propertyName], resultError[propertyName], "Test \"" + testObject.name + "\" - The error property \"" + propertyName + "\" should have been \"" + testObjectError[propertyName] + "\", but was \"" + resultError[propertyName] + "\".");
                    }
                }
            }
        });
    }
}

test.showResults();