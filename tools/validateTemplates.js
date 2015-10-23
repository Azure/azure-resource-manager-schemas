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

var deploymentTemplateSchema = utilities.readJSONFile(path.join(schemasFolderPath, "2015-01-01/deploymentTemplate.json"));

var externalSchemas = [];

var testFiles = getTestFiles();
for(var testFileIndex in testFiles)
{
    var testFilePath = testFiles[testFileIndex];
    console.log("Running test file \"" + testFilePath + "\"");
    
    var tests = utilities.readJSONFile(testFilePath);
    
    for(var testIndex in tests)
    {
        var testObject = tests[testIndex];
        console.log("\tRunning test \"" + testObject.name + "\"");
        
        test.run(function()
        {
            var finishedValidating = false;
            while(!finishedValidating)
            {
                var result = validator.validate(testObject.deploymentTemplate, deploymentTemplateSchema, externalSchemas);
                if(result.missingSchemas && result.missingSchemas.length > 0)
                {
                    for(var missingSchemaIndex in result.missingSchemas)
                    {
                        var missingSchemaPath = result.missingSchemas[missingSchemaIndex];
                        var externalSchemaPaths = externalSchemas.map(function(value) { return value.path; });
                        if(!utilities.contains(externalSchemaPaths, missingSchemaPath))
                        {
                            var missingSchemaJSON = utilities.readJSONUri(missingSchemaPath);
                            externalSchemas.push( { "path": missingSchemaPath, "json": missingSchemaJSON } );
                        }
                    }
                    
                    finishedValidating = false;
                }
                else
                {
                    finishedValidating = true;
                }
            }
            assert.Equal(testObject.valid, result.valid, "Test \"" + testObject.name + "\" should " + (testObject.valid ? "" : "not ") + "have been valid, but it was" + (result.valid ? "" : " not") + ".");
            
            assert.Equal(testObject.errors.length, result.errors.length, "Test \"" + testObject.name + "\" - The lengths of " + JSON.stringify(testObject.errors) + " and " + JSON.stringify(result.errors) + " were not equal.");
            for(var errorIndex in testObject.errors)
            {
                var testObjectError = testObject.errors[errorIndex];
                var resultError = result.errors[errorIndex];
                
                for(var propertyName in testObjectError)
                {
                    assert.Equal(testObjectError[propertyName], resultError[propertyName], "Test \"" + testObject.name + "\" - The error property \"" + propertyName + "\" should have been \"" + testObjectError[propertyName] + "\", but was \"" + resultError[propertyName] + "\".");
                }
            }
        });
    }
}

test.showResults();