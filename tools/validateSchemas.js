var fs = require("fs");
var path = require("path");

var assert = require("./assert.js");
var test = require("./test.js");
var validator = require("./validateJSON.js");

function iterateFiles(folder, callback)
{
    var files = fs.readdirSync(folder);
    for(var fileIndex in files)
    {
        var filePath = path.join(folder, files[fileIndex]);
        
        var fileStats = fs.statSync(filePath);
        if(fileStats.isDirectory())
        {
            iterateFiles(filePath, callback);
        }
        else if(fileStats.isFile())
        {
            callback(filePath);
        }
    }
}

function getTestFiles(folder)
{
    var testFiles = [];
    
    iterateFiles(folder, function(filePath)
    {
       if(filePath.endsWith(".tests.json"))
       {
           testFiles.push(filePath);
       } 
    });
    
    return testFiles;
}

function readJSONFile(filePath)
{
    var fileContents = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, '');;
    return JSON.parse(fileContents);
}

var schemasFolderPath = path.join(__dirname, "../schemas/");

var deploymentTemplateSchema = readJSONFile(path.join(schemasFolderPath, "2014-04-01-preview/deploymentTemplate.json"));

var testFiles = getTestFiles(schemasFolderPath);
for(var testFileIndex in testFiles)
{
    var testFilePath = testFiles[testFileIndex];
    
    var tests = readJSONFile(testFilePath);
    
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