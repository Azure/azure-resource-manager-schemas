var path = require("path");

var assert = require("./assert.js");
var test = require("./test.js");
var utilities = require("./utilities.js");
var validator = require("./validateJSON.js");

function getTestFiles(folder)
{
    var testFiles = [];
    
    utilities.forEachFile(folder, function(filePath)
    {
       if(filePath.endsWith(".tests.json"))
       {
           testFiles.push(filePath);
       } 
    });
    
    return testFiles;
}

var schemasFolderPath = utilities.getSchemasFolderPath();
var testsFolderPath = utilities.getTestsFolderPath();

var deploymentTemplateSchema = utilities.readJSONFile(path.join(schemasFolderPath, "2014-04-01-preview/deploymentTemplate.json"));

var testFiles = getTestFiles(schemasFolderPath);
for(var testFileIndex in testFiles)
{
    var testFilePath = testFiles[testFileIndex];
    
    var tests = utilities.readJSONFile(testFilePath);
    
    for(var testIndex in tests)
    {
        var testObject = tests[testIndex];
        
        test.run(function()
        {
            var result = validator.validate(testObject.deploymentTemplate, deploymentTemplateSchema);
            assert.Equal(testObject.valid, result.valid);
            
            assert.Equal(testObject.errors.length, result.errors.length, "The lengths of " + JSON.stringify(testObject.errors) + " and " + JSON.stringify(result.errors) + " were not equal.");
            for(var errorIndex in testObject.errors)
            {
                var testObjectError = testObject.errors[errorIndex];
                var resultError = result.errors[errorIndex];
                
                for(var propertyName in testObjectError)
                {
                    assert.Equal(testObjectError[propertyName], resultError[propertyName]);
                }
            }
        });
    }
}

test.showResults();