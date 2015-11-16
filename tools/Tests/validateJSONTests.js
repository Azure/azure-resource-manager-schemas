var assert = require("../assert.js");
var test = require("../test.js");
var vrs = require("../validateJSON.js");

function testPass(json, schema)
{
    test.run(function()
    {
        var result = vrs.validate(json, schema);
        assert.True(result.valid);
        assert.Empty(result.errors);
    });
}

function testFail(json, schema, expectedErrors)
{
    test.run(function()
    {
        var result = vrs.validate(json, schema);
        assert.False(result.valid);
        assert.NotNull(result.errors);
        
        if(expectedErrors)
        {
            assert.Equal(expectedErrors.length, result.errors.length);
            for(var index in expectedErrors)
            {
                for(var propertyName in expectedErrors[index])
                {
                    assert.Equal(expectedErrors[index][propertyName], result.errors[index][propertyName]);
                }
            }
        }
    });
}

function testErrorLog(json, schema, expectedMessage)
{
    var previousLogger = vrs.logger;
    try
    {
        var errors = [];
        vrs.logger = function(message) { errors.push(message); };
        
        test.run(function()
        {
            assert.Throws(function() { vrs.validate(json, schema); });
        
            assert.Equal(1, errors.length);
            assert.Equal(expectedMessage, errors[0]);
        });
    }
    finally
    {
        vrs.logger = previousLogger;    
    }
}

module.exports.runTests = runTests;
function runTests()
{
    runAsbjornengeTests();

    testPass({}, {});
    testPass({}, 5);
    testPass({}, "meta-schema");
    testErrorLog({}, "", "ERROR: Cannot use an empty schema for validation.");
    
    testErrorLog(null, null, "ERROR: Cannot validate a null json object.");
    testErrorLog(undefined, null, "ERROR: Cannot validate an undefined json object.");
    testErrorLog("", null, "ERROR: Cannot validate an empty json object.");
    testErrorLog("I'm not a schema!", null, "ERROR: Cannot use a null schema for validation.");
    testErrorLog(null, {}, "ERROR: Cannot validate a null json object.");
    testErrorLog({}, null, "ERROR: Cannot use a null schema for validation.");
    testErrorLog({}, undefined, "ERROR: Cannot use an undefined schema for validation.");
    testErrorLog(undefined, undefined, "ERROR: Cannot validate an undefined json object.");
}

/**
 * Examples taken from http://www.asbjornenge.com/wwc/json_schema.html
 */
function runAsbjornengeTests()
{
    testPass(
        { title: "Kapsokisio" },
        {
            type: "object",
            required: ["title"],
            properties:
            {
                title: { type: "string" }
            }
        });
    var schemaType =
    {
        type: ["object","string"]
    };
    testPass({}, schemaType);
    testFail([], schemaType,
    [{
        schemaPath: "/type",
        message: "Invalid type: array (expected object/string)",
    }]);
    
    var schemaEnum =
    {
        enum: [[1,true,0], {}, 28, "Burbon"]
    }
    testPass([1,true,0], schemaEnum);
    testPass({}, schemaEnum);
    testPass(28, schemaEnum);
    testPass("Burbon", schemaEnum);
    testFail(34, schemaEnum,
    [{
        schemaPath: "/type",
        message: "No enum match for: 34",
    }]);
    
    var schemaRequired =
    {
        required: ["title", "origin"]
    };
    testPass({ title: "", origin: "" }, schemaRequired);
    testFail({ title: "" }, schemaRequired,
    [{
        schemaPath: "/required/1",
        message: "Missing required property: origin",
    }]);
    
    var schemaProperties =
    {
        properties:
        {
            title: { type: "string" },
            weight: { type: "number" },
        }   
    };
    testPass({ title: "", weight: 2 }, schemaProperties);
    testFail({ title: "", weight: "2" }, schemaProperties,
    [{
        schemaPath: "/properties/weight/type",
        message: "Invalid type: string (expected number)",
    }])
    
    var schemaItems =
    {
        items:
        [
            { type: "string" },
            { type: "object" },
        ]
    };
    testPass(["",{}], schemaItems);
    testFail(["",true], schemaItems,
    [{
        schemaPath: "/items/1/type",
        message: "Invalid type: boolean (expected object)",
    }]);
    
    var schemaPattern =
    {
        properties:
        {
            url:
            {
                type: "string",
                pattern: /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/
            }
        }
    };
    testPass({ url: "http://google.com" }, schemaPattern);
    testFail({ url: "htt:/googleco.m" }, schemaPattern,
    [{
        schemaPath: "/properties/url/pattern",
        message: "String does not match pattern: {pattern}",
    }]);
    
    var schemaRef =
    {
        items: { $ref: "#/definitions/bean" },
        definitions:
        {
            bean:
            {
                type: "object",
                required: [ "origin" ],
                properties:
                {
                    origin:
                    {
                        enum: [ "kenya", "rawanda" ]
                    }
                }
            }
        }   
    };
    testPass([ { origin: "kenya" } ], schemaRef);
    testFail([ { origin: "brazil" } ], schemaRef,
    [{
        schemaPath: "/items/properties/origin/type",
        message: "No enum match for: \"brazil\"",   
    }]);
    testFail([ "kenya", "rawanda" ], schemaRef,
    [
        // For "kenya"
        {
            schemaPath: "/items/type",
            message: "Invalid type: string (expected object)",
        },
        // For "rawanda"
        {
            schemaPath: "/items/type",
            message: "Invalid type: string (expected object)",
        }
    ]);
    
    var schemaAllOf =
    {
        allOf :
        [
            { type : "integer" },
            { minimum : 6 }
        ]
    };
    testPass(6, schemaAllOf);
    testFail(5, schemaAllOf,
    [{
        schemaPath: "/allOf/1/minimum",
        message: "Value 5 is less than minimum 6",
    }]);
    
    var schemaOneOf =
    {
        oneOf :
        [
            { type    : "integer" },
            { minimum : 6 }
        ]
    };
    testPass(5, schemaOneOf);
    testFail(6, schemaOneOf,
    [{
        schemaPath: "/oneOf",
        message: "Data is valid against more than one schema from \"oneOf\": indices 0 and 1",
    }]);
    
    var schemaAnyOf =
    {
        anyOf :
        [
            { type    : "integer"  },
            { minimum : 6 }
        ]
    };
    testPass(5, schemaAnyOf);
    testPass(6, schemaAnyOf);
    
    var schemaNot = { not: { type: "string" } };
    testPass(1, schemaNot);
    testFail("test", schemaNot);
    
    var schemaRealWorld =
    {
        "type" : "object",
        "required" : ["title","origin","variety","process","roast","bag"],
        "properties" : {
            "title"    : { "type" : "string"  },
            "origin"   : { "type" : "string"  },
            "variety"  : { "type" : "array"   },
            "process"  : { "type" : "string" },
            "bag"      : { "$ref" : "#/definitions/bag" },
            "roast"    : { "$ref" : "#/definitions/roast" },
            "brew_tip" : { "$ref" : "#/definitions/brew_tip" }
        },
        "definitions" : {
            "roast" : {
                "type" : "object",
                "required" : ["level", "date"],
                "properties" : {
                    "level" : { "type" : "integer" },
                    "date"  : { 
                        "type" : "string", 
                        "pattern" : /^\d{2}([./-])\d{2}\1\d{4}$/
                    }
                }
            },
            "bag" : {
                "type" : "object",
                "required" : ["weight", "date"],
                "properties" : {
                    "weight" : { "type" : "number" },
                    "date"   : { 
                        "type" : "string", 
                        "pattern" : /^\d{2}([./-])\d{2}\1\d{4}$/
                    }
                }
            },
            "brew_tip" : {
                "type" : "object",
                "required" : ["method","grind","vessle"],
                "properties" : {
                    "method" : { "type" : "string" },
                    "grind"  : { "type" : "string" },
                    "vessel" : { "type" : "string" }
                }
            }
        }
    };
    testPass(
    {
        "title"   : "Kapsokisio",
        "origin"  : "Kenya",
        "variety" : ["SL28","SL34","Burbon"],
        "process" : "Washed",
        "roast" :
        {
            "level" : 4,
            "date"  : "08.02.2012"
        },
        "bag" :
        {
            "weight" : 354,
            "date"   : "08.02.2012"
        },
        "brew_tip" :
        {
            "method" : "pourover",
            "grind"  : "medium",
            "vessle" : "chemex"
        }
    },
    schemaRealWorld);
}

if(require.main === module)
{
    runTests();
    
    test.showResults();
}