var fs = require("fs");
var path = require("path");
var syncRequest = require("sync-request")

var currentFileDirectory = __dirname;

module.exports.getSchemasFolderPath = getSchemasFolderPath;
function getSchemasFolderPath()
{
    return path.join(currentFileDirectory, "../schemas/");
}

module.exports.getTestsFolderPath = getTestsFolderPath;
function getTestsFolderPath()
{
    return path.join(currentFileDirectory, "../tests/");
}

module.exports.pathExists = pathExists;
function pathExists(path)
{
    var result = true;
    try
    {
        fs.statSync(path);    
    }
    catch(e)
    {
        result = false;
    }
    return result;
}

module.exports.forEachFile = forEachFile;
function forEachFile(folder, callback)
{
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

module.exports.getFiles = getFiles;
function getFiles(folder, filterFunction)
{
    var files = [];
    
    if(typeof filterFunction === "string")
    {
        var fileExtension = filterFunction;
        filterFunction = function(filePath) { return filePath.endsWith(fileExtension); };
    }
    
    forEachFile(folder, function(filePath)
    {
        if(filterFunction(filePath))
        {
            files.push(filePath);
        }
    });
    
    return files;
}

function stripUTF8BOM(value)
{
    return value.replace(/^\uFEFF/, '');
}

module.exports.readJSONPath = readJSONPath;
function readJSONPath(jsonUri, schemaFolderPath) {
    
    if(schemaFolderPath && (!schemaFolderPath.endsWith('/') && !schemaFolderPath.endsWith('\\')))
    {
        schemaFolderPath += "/";
    }
    
    var retval;

    var azurePrefix = "http://schema.management.azure.com/schemas/";
    var jsonPath;
    if (jsonUri.startsWith(azurePrefix) && schemaFolderPath && pathExists(schemaFolderPath)) {
        jsonPath = jsonUri.replace(azurePrefix, schemaFolderPath);
    }
    else {
        jsonPath = jsonUri;
    }
    
    if (jsonPath.startsWith("http:") || jsonPath.startsWith("https:")) {
        retval = readJSONUri(jsonPath);
    }
    else
    {
        retval = readJSONFile(jsonPath);
    }

    return retval;
}

module.exports.readJSONFile = readJSONFile;
function readJSONFile(filePath)
{
    var fileContents = fs.readFileSync(filePath, "utf8");
    var fileContentsWithoutBOM = stripUTF8BOM(fileContents);
    return JSON.parse(fileContentsWithoutBOM);
}

module.exports.readJSONUri = readJSONUri;
function readJSONUri(uri)
{
    var response = syncRequest("GET", uri);
    var responseBody = stripUTF8BOM(response.getBody("utf8"));
    return JSON.parse(responseBody);
}

module.exports.contains = contains;
function contains(container, value, comparisonFunction)
{
    if(!comparisonFunction)
    {
        comparisonFunction = function(lhs, rhs) { return lhs === rhs; };
    }
    
    var result = false;
    
    for(var i = 0; i < container.length; ++i)
    {
        if(comparisonFunction(container[i], value))
        {
            result = true;
            break;
        }
    }
    
    return result;
}

module.exports.unique = unique;
function unique(array)
{
    var result = [];
    
    for(var i = 0; i < this.length; ++i)
    {
        if(!contains(result, array[i]))
        {
            result.push(array[i]);
        }
    }
    
    return result;
}

module.exports.repeat = repeat;
function repeat(value, count)
{
    var result = value;
    for(var i = 1; i < count; ++i)
    {
        result += value;
    }
    return result;
}

var singleIndentSpaceCount = 4;
var singleIndent = repeat(" ", singleIndentSpaceCount);

module.exports.toString = toString;
function toString(value, indent)
{
    if (!indent)
    {
        indent = "";
    }

    var result;
    if(Array.isArray(value))
    {
        result = indent + "[";
        var addComma = false;
        for (var index in value) {
            if (addComma) {
                result += ",";
            }
            else {
                addComma = true;
            }

            var elementIndent = indent + singleIndent;
            var elementString = toString(value[index], elementIndent);
            result += "\n" + elementString;
        }
        result += "\n" + indent + "]";
    }
    else if (typeof value === "object" && value !== null)
    {
        result = indent + "{";
        var addComma = false;
        for (var propertyName in value) {
            if (addComma) {
                result += ",";
            }
            else {
                addComma = true;
            }

            var propertyIndent = indent + singleIndent;
            var propertyValueString = toString(value[propertyName], propertyIndent);
            result += "\n" + propertyIndent + "\"" + propertyName + "\": " + propertyValueString;
        }
        result += "\n" + indent + "}";
    }
    else
    {
        result = JSON.stringify(value);
    }

    return result;
}

module.exports.equals = equals;
function equals(lhs, rhs)
{
    var result = (lhs === rhs);

    if(!result && typeof lhs === typeof rhs)
    {
        if(typeof lhs === "object")
        {
            result = true;
            for (var lhsPropertyName in lhs) {
                if (!equals(lhs[lhsPropertyName], rhs[lhsPropertyName])) {
                    result = false;
                    break;
                }
            }
            for (var rhsPropertyName in rhs) {
                if (!equals(lhs[rhsPropertyName], rhs[rhsPropertyName])) {
                    result = false;
                    break;
                }
            }
        }
    }

    return result;
}