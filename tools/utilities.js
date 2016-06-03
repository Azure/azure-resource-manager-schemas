"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const syncRequest = require("sync-request");

module.exports.forEachFile = forEachFile;
/**
 * Execute the provided callback for each of the files recursively found in the provided folderPath.
 * @param {String} folderPath The path to recursively find files in.
 * @param callback (filePath: string) => void, The callback to call for each file.
 */
function forEachFile(folderPath, callback) {
    const folderEntryNames = fs.readdirSync(folderPath);
    for (const entryName of folderEntryNames) {
        const entryPath = path.join(folderPath, entryName);

        const entryStats = fs.statSync(entryPath);
        if (entryStats.isDirectory()) {
            forEachFile(entryPath, callback);
        }
        else {
            assert(entryStats.isFile());
            callback(entryPath);
        }
    }
}

module.exports.getFiles = getFiles;
/**
 * Recursively get the files in the provided folder path that match the provided filter callback.
 * @param {string} folderPath The path to the folder to recursively search.
 * @param filterCallback (filePath: string) => boolean, Whether to return a given file or not.
 * @returns {string[]} The files in the provided folder path that match the filter callback.
 */
function getFiles(folderPath, filterCallback) {
    const result = [];
    
    forEachFile(folderPath, function(filePath) {
        if (filterCallback(filePath)) {
            result.push(filePath);
        }
    });
    
    return result;
}



module.exports.findFileOrFolder = findFileOrFolder;
/**
 * Look for a file or folder off of the provided startFolderPath and each of its parent folders as
 * well.
 * @param {String} entryName The name of the file or folder to look for.
 * @param {String} [startFolderPath=__dirname] The folder path to start looking in.
 * @returns {String} The found file or folder's path, or null if the entry wasn't found.
 */
function findFileOrFolder(entryName, startFolderPath) {
    if (!startFolderPath) {
        startFolderPath = __dirname;
    }
    
    /** @type {String} */
    let result = null;

    let folderPath = startFolderPath;
    while (folderPath) {
        result = path.join(folderPath, entryName);
        if (pathExists(result)) {
            break;
        }
        else {
            let lastSlash = folderPath.lastIndexOf("/");
            if (lastSlash === -1) {
                lastSlash = folderPath.lastIndexOf("\\");
            }

            if (lastSlash === -1) {
                result = null;
                folderPath = "";
            }
            else {
                folderPath = folderPath.substring(0, lastSlash);
            }
        }
    }

    return result;
}

module.exports.getSchemasFolderPath = getSchemasFolderPath;
function getSchemasFolderPath() {
    return findFileOrFolder("schemas");
}

module.exports.pathExists = pathExists;
/**
 * Determine if the provided path (file or folder) exists.
 * @param {string} path The path to check.
 * @returns {boolean} Whether the path exists or not.
 */
function pathExists(path) {
    assert(path, "Cannot check if a null, undefined, or empty path exists.");

    let result = true;
    try {
        fs.statSync(path);
    }
    catch (error) {
        result = false;
    }
    return result;
}

module.exports.stripUTF8BOM = stripUTF8BOM;
/**
 * Strip away the UTF-8 Byte Order Mark (BOM) from the provided string.
 * @param {string} value The string value to remove the UTF-8 BOM from.
 * @returns {string} The provided value without a UTF-8 BOM, if it had one.
 */
function stripUTF8BOM(value) {
    return value ? value.replace(/^\uFEFF/, '') : value;
}

module.exports.readJSONPath = readJSONPath;
/**
 * Read the JSON file that is at the provided path.
 * @param {string} jsonUri The uri or file path to the JSON file.
 * @param {string} [schemaFolderPath] The path to the local schemas folder that can be used if an
 *          Azure resource schema is being requested.
 */
function readJSONPath(jsonUri, schemaFolderPath) {
    if (schemaFolderPath && (!schemaFolderPath.endsWith('/') && !schemaFolderPath.endsWith('\\'))) {
        schemaFolderPath += "/";
    }

    const azurePrefix = /^https?:\/\/schema.management.azure.com\/schemas\//

    const hashIndex = jsonUri.indexOf("#");
    if (hashIndex !== -1) {
        jsonUri = jsonUri.substring(0, hashIndex);
    }

    let jsonPath;
    if (jsonUri.match(azurePrefix) && schemaFolderPath && pathExists(schemaFolderPath)) {
        jsonPath = jsonUri.replace(azurePrefix, schemaFolderPath);
    }
    else {
        jsonPath = jsonUri;
    }

    let jsonContents;
    if (jsonPath.startsWith("http:") || jsonPath.startsWith("https:")) {
        jsonContents = syncRequest("GET", jsonPath).getBody("utf8");
    }
    else {
        jsonContents = fs.readFileSync(jsonPath, "utf8");
    }

    return JSON.parse(stripUTF8BOM(jsonContents));
}

const singleIndent = "  ";

module.exports.toString = toString;
/**
 * Convert the provided value to a string with the provided indentation.
 * @param {any} value The value to convert to a string.
 * @param {string} [indent=""] The indentation to apply to the generated string.
 * @returns {string} The string version of the provided value.
 */
function toString(value, indent) {
    if (!indent) {
        indent = "";
    }

    let result;
    let addComma = false;
    if (Array.isArray(value)) {
        result = indent + "[";

        for (let index = 0; index < value.length; ++index) {
            if (index > 0) {
                result += ",";
            }

            const elementIndent = indent + singleIndent;
            const elementString = toString(value[index], elementIndent);
            result += `\n${elementIndent}${elementString}`;
        }
        result += `\n${indent}]`;
    }
    else if (typeof value === "object" && value) {
        result = "{";
        for (const propertyName in value) {
            if (addComma) {
                result += ",";
            }
            else {
                addComma = true;
            }

            const propertyIndent = indent + singleIndent;
            const propertyValueString = toString(value[propertyName], propertyIndent);
            result += `\n${propertyIndent}"${propertyName}": ${propertyValueString}`;
        }
        result += "\n" + indent + "}";
    }
    else if (value === undefined) {
        result = "undefined";
    }
    else {
        result = JSON.stringify(value);
    }

    return result;
}