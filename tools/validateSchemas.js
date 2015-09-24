var path = require("path");

var utilities = require("./utilities.js");
var validator = require("./validateJSON.js");

var schemasFolderPath = utilities.getSchemasFolderPath();
var schemaFilePaths = [];
utilities.forEachFile(schemasFolderPath, function(filePath)
{
    if(filePath.endsWith(".json"))
    {
        schemaFilePaths.push(filePath);
    }
});

var metaSchemaFilePath = path.join(__dirname, "ResourceMetaSchema.json");
var metaSchemaJSON = utilities.readJSONFile(metaSchemaFilePath);

var schemasValidated = 0;
for(var schemaFilePathIndex in schemaFilePaths)
{
    var schemaFilePath = schemaFilePaths[schemaFilePathIndex];
    
    var schemaFileName = path.basename(schemaFilePath);
    if(schemaFileName !== "deploymentParameters.json" &&
       schemaFileName !== "deploymentTemplate.json")
    {
        if(schemasValidated > 0)
        {
            console.log();
        }
        ++schemasValidated;
        
        console.log(schemaFilePath);
        
        var schemaJSON = utilities.readJSONFile(schemaFilePath);
        var validationResult = validator.validate(schemaJSON, metaSchemaJSON);
        
        if(!validationResult.valid)
        {
            for(var errorIndex in validationResult.errors)
            {
                var error = validationResult.errors[errorIndex];
                console.log("\t" + (parseInt(errorIndex) + 1) + ". Error at \"" + error.dataPath + "\" - " + error.message);
            }
        }
        else
        {
            console.log("\tPassed");
        }
    }
}