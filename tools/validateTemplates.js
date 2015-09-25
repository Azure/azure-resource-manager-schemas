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
    
    var tests = utilities.readJSONFile(testFilePath);
    
    for(var testIndex in tests)
    {
        var testObject = tests[testIndex];
        
        test.run(function()
        {
            var finishedValidating = false;
            while(!finishedValidating)
            {
                finishedValidating = true;
                
                for(var i = 0; i < externalSchemas.length; ++i)
                {
                    validator.addExternalSchema(externalSchemas[i].path, externalSchemas[i].json);    
                }
                
                var result = validator.validate(testObject.deploymentTemplate, deploymentTemplateSchema, function(missingExternalSchemas)
                {
                    for(var i in missingExternalSchemas)
                    {
                        var missingExternalSchemaUri = missingExternalSchemas[i];
                        var externalSchemaUris = externalSchemas.map(function(value) { return value.path; });
                        if(!utilities.contains(externalSchemaUris, missingExternalSchemaUri))
                        {
                            var missingExternalSchemaJSON = utilities.readJSONUri(missingExternalSchemaUri);
                            externalSchemas.push( { "path": missingExternalSchemaUri, "json": missingExternalSchemaJSON } );
                        }
                    }
                    
                    finishedValidating = false;
                });
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