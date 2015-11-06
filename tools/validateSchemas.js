var path = require("path");

var utilities = require("./utilities.js");
var validator = require("./validateJSON.js");

var schemasFolderPath = utilities.getSchemasFolderPath();
var schemaFilePaths = utilities.getFiles(schemasFolderPath, function(filePath)
{
    var result = false;
    if(filePath.endsWith(".json"))
    {
        var schemaFileName = path.basename(filePath);
        result = schemaFileName !== "deploymentParameters.json" &&
                 schemaFileName !== "deploymentTemplate.json";
    }   
    return result;
});

function getMetaSchemas(metaSchemaPaths)
{
    var result = [];
    
    for(var i in metaSchemaPaths)
    {
        var metaSchemaPath = metaSchemaPaths[i];
        
        var metaSchemaJson;
        if(utilities.pathExists(metaSchemaPath))
        {
            metaSchemaJson = utilities.readJSONFile(metaSchemaPath);
        }
        else
        {
            metaSchemaJson = utilities.readJSONUri(metaSchemaPath);
        }
        
        result.push({ "path": metaSchemaPath, "json": metaSchemaJson });
    }
    
    return result;
}
var metaSchemas = getMetaSchemas(
[
    path.join(__dirname, "ResourceMetaSchema.json"),
    "http://json-schema.org/draft-04/schema"
]);

for(var schemaFilePathIndex in schemaFilePaths)
{
    var schemaFilePath = schemaFilePaths[schemaFilePathIndex];
    
    if(schemaFilePathIndex > 0)
    {
        console.log();
    }
    
    console.log(schemaFilePath);
    
    var schemaJSON = utilities.readJSONFile(schemaFilePath);
    
    for(var metaSchemaIndex in metaSchemas)
    {
        var metaSchema = metaSchemas[metaSchemaIndex];
        
        //console.log("schemasFolderPath: \"" + schemasFolderPath + "\"");
        var validationResult = validator.validate(schemaJSON, metaSchema.json, schemasFolderPath);
        
        console.log("\tUsing schema: \"" + metaSchema.path + "\"");
        if(!validationResult.valid)
        {
            console.log("\t\tFailed");
            for(var errorIndex in validationResult.errors)
            {
                var error = validationResult.errors[errorIndex];
                console.log("\t\t" + (parseInt(errorIndex) + 1) + ". Error at \"" + error.dataPath + "\" - " + error.message);
            }
        }
        else
        {
            console.log("\t\tPassed");
        }
    }
}