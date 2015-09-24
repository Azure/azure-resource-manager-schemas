var currentFileDirectory = __dirname;

module.exports.getSchemasFolderPath = getSchemasFolderPath;
function getSchemasFolderPath()
{
    var path = require("path");
    
    return path.join(currentFileDirectory, "../schemas/");
}

module.exports.getTestsFolderPath = getTestsFolderPath;
function getTestsFolderPath()
{
    var path = require("path");
    
    return path.join(currentFileDirectory, "../tests/");
}

module.exports.forEachFile = forEachFile;
function forEachFile(folder, callback)
{
    var fs = require("fs");
    var path = require("path");
    
    var files = fs.readdirSync(folder);
    for(var fileIndex in files)
    {
        var filePath = path.join(folder, files[fileIndex]);
        
        var fileStats = fs.statSync(filePath);
        if(fileStats.isDirectory())
        {
            forEachFile(filePath, callback);
        }
        else if(fileStats.isFile())
        {
            callback(filePath);
        }
    }
}

module.exports.readJSONFile = readJSONFile;
function readJSONFile(filePath)
{
    var fs = require("fs");
    
    var fileContents = fs.readFileSync(filePath, "utf8");
    var fileContentsWithoutBOM = fileContents.replace(/^\uFEFF/, '');
    return JSON.parse(fileContentsWithoutBOM);
}
