"use strict";

var assert = require('assert')
var path = require('path')
var fs = require('fs')
var url = require('url')
var SchemaService = require("vscode-json-languageservice");
var Types = require('vscode-languageserver-types');
var forEach = require('mocha-each');

function normalizedSchemaId(id) {
    if (id.length && id[id.length - 1] === '#') {
        id = id.substr(0, id.length - 1);
    }

    return id;
};

function requestServiceMock(uri) {
    var schemaRootUri = 'https://schema.management.azure.com/schemas';
    uri = normalizedSchemaId(uri);

    if (uri.startsWith(schemaRootUri)) {
        var relativePath = uri.substr(schemaRootUri.length);

        if (relativePath) {
            return new Promise(function (resolve, reject) {
                var filePath = path.join(__dirname, '../schemas', relativePath);

                fs.readFile(filePath, 'UTF-8', function (err, result) {
                    err ? reject('Resource not found.') : resolve(result.toString());
                });
            });
        }
    }

    return Promise.reject('Resource not found.');
};

var workspaceContext = {
    resolveRelativePath: function (relativePath, resource) {
        return url.resolve(resource, relativePath);
    }
};

var parameters = {
    schemaRequestService: requestServiceMock,
    workspaceContext: workspaceContext
};

var service = SchemaService.getLanguageService(parameters);
var testFolder = './templateFiles';

function validateTemplateWithSchema(file) {
    var filePath = path.join(__dirname, testFolder, file);
    var content = fs.readFileSync(filePath, 'utf8');

    var textDocument = Types.TextDocument.create(filePath, 'json', 0, content);
    var jsonDocument = service.parseJSONDocument(textDocument);

    return service.doValidation(textDocument, jsonDocument);
};

describe('validate template files with schema - ', function () {
    var files = fs.readdirSync(testFolder);

    // // it.each(files, "running schema validation on '%s'", ['element'], function (element) {
    // // 	this.timeout(5000);

    // // 	validateTemplateWithSchema(element)
    // // 	.then(
    // // 		function(result) {
    // // 			//assert.fail("test failed");
    // // 			assert.deepEqual(result, [], 'test failed');

    // // 			//console.log(JSON.stringify(result, null, 2));
    // // 			//next();
    // // 		});
    // // 	// .then(() => testDone(), (error) => {
    // // 	// 	testDone(error);
    // // 	// })
    // // 	//.catch((err) => { console.log(err); })
    // // 	//.then(() => next());

    // // 	// console.log(validateResult);
    // // });

    forEach(files).it("running schema validation on '%s'", function (file, done) {
        this.timeout(5000);

        validateTemplateWithSchema(file)
            .then(function (result) {
                assert.deepEqual(result, [], 'there are validation errors.');
            }
            ).then(
            function () { done() },
            function (error) { done(error) }
            );
    });
});