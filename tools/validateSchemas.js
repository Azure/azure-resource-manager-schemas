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

var metaSchemaPaths =
[
    path.join(__dirname, "ResourceMetaSchema.json"),
    "http://json-schema.org/draft-04/schema",
]
var metaSchemaJSONObjects =
[
    utilities.readJSONFile(metaSchemaPaths[0]),
    utilities.readJSONUri(metaSchemaPaths[1]),
]

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
        
        var foundErrors = false;
        for(var metaSchemaIndex in metaSchemaJSONObjects)
        {
            var metaSchemaJSON = metaSchemaJSONObjects[metaSchemaIndex];
            
            var validationResult = validator.validate(schemaJSON, metaSchemaJSON,
            [
                {
                    "path": metaSchemaPaths[metaSchemaIndex],
                    "json": metaSchemaJSON,
                }
            ]);

            if(!validationResult.valid)
            {
                foundErrors = true;
                console.log("\tUsing schema: \"" + metaSchemaPaths[metaSchemaIndex] + "\"");
                
                for(var errorIndex in validationResult.errors)
                {
                    var error = validationResult.errors[errorIndex];
                    console.log("\t\t" + (parseInt(errorIndex) + 1) + ". Error at \"" + error.dataPath + "\" - " + error.message);
                }
            }
        }
        if(!foundErrors)
        {
            console.log("\tPassed");
        }
    }
}