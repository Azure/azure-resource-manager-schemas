var assert = require("../assert.js");
var test = require("../test.js");
var tv4 = require("tv4");

function testPass(schema, metaSchema) {
  test.run(function () {
    var result = tv4.validate(schema, metaSchema);
    assert.True(result);
    assert.Null(tv4.error);
  });
}

function testFail(schema, metaSchema, expectedErrorValues) {
  test.run(function () {
    var result = tv4.validate(schema, metaSchema);
    assert.False(result);
    assert.NotNull(tv4.error);
    for (var propertyName in expectedErrorValues) {
      assert.Equal(expectedErrorValues[propertyName], tv4.error[propertyName]);
    }
  });
}

function testThrows(testFunction, expectedErrorMessage) {
  test.run(function () {
    assert.Throws(testFunction, function (error) {
      assert.Equal(expectedErrorMessage, error.message);
    });
  });
}

module.exports.runTests = runTests;
function runTests() {
  runAsbjornengeTests();

  testPass({}, {});
  testPass({}, 5);
  testPass({}, "meta-schema");
  testPass("hello", { "type": "string" });
  testFail({}, "",
    {
      schemaPath: "",
      message: "Circular $refs: ",
    });
  testFail(null, "",
    {
      schemaPath: "",
      message: "Circular $refs: ",
    });

  testThrows(function () { tv4.validate(null, null); }, "Cannot read property '$ref' of null");
  testThrows(function () { tv4.validate(undefined, null); }, "Cannot read property '$ref' of null");
  testThrows(function () { tv4.validate("", null); }, "Cannot read property '$ref' of null");
  testThrows(function () { tv4.validate("I'm not a schema!", null); }, "Cannot read property '$ref' of null");
  testThrows(function () { tv4.validate(null, undefined); }, "Cannot read property '$ref' of undefined");
  testThrows(function () { tv4.validate(undefined, undefined); }, "Cannot read property '$ref' of undefined");
  testThrows(function () { tv4.validate("", undefined); }, "Cannot read property '$ref' of undefined");
  testThrows(function () { tv4.validate("I'm not a schema!", undefined); }, "Cannot read property '$ref' of undefined");
}

/**
 * Examples taken from http://www.asbjornenge.com/wwc/json_schema.html
 */
function runAsbjornengeTests() {
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
      type: ["object", "string"]
    };
  testPass({}, schemaType);
  testFail([], schemaType,
    {
      schemaPath: "/type",
      message: "Invalid type: array (expected object/string)",
    });

  var schemaEnum =
    {
      enum: [[1, true, 0], {}, 28, "Burbon"]
    }
  testPass([1, true, 0], schemaEnum);
  testPass({}, schemaEnum);
  testPass(28, schemaEnum);
  testPass("Burbon", schemaEnum);
  testFail(34, schemaEnum,
    {
      schemaPath: "/type",
      message: "No enum match for: 34",
    });

  var schemaRequired =
    {
      required: ["title", "origin"]
    };
  testPass({ title: "", origin: "" }, schemaRequired);
  testFail({ title: "" }, schemaRequired,
    {
      schemaPath: "/required/1",
      message: "Missing required property: origin",
    });

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
    {
      schemaPath: "/properties/weight/type",
      message: "Invalid type: string (expected number)",
    });

  var schemaItems =
    {
      items:
      [
        { type: "string" },
        { type: "object" },
      ]
    };
  testPass(["", {}], schemaItems);
  testFail(["", true], schemaItems,
    {
      schemaPath: "/items/1/type",
      message: "Invalid type: boolean (expected object)",
    });

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
    {
      schemaPath: "/properties/url/pattern",
      message: "String does not match pattern: {pattern}",
    });

  var schemaRef =
    {
      items: { $ref: "#/definitions/bean" },
      definitions:
      {
        bean:
        {
          type: "object",
          required: ["origin"],
          properties:
          {
            origin:
            {
              enum: ["kenya", "rawanda"]
            }
          }
        }
      }
    };
  testPass([{ origin: "kenya" }], schemaRef);
  testFail([{ origin: "brazil" }], schemaRef,
    {
      schemaPath: "/items/properties/origin/type",
      message: "No enum match for: \"brazil\"",
    });
  testFail(["kenya", "rawanda"], schemaRef,
    {
      schemaPath: "/items/type",
      message: "Invalid type: string (expected object)",
    });

  var schemaAllOf =
    {
      allOf:
      [
        { type: "integer" },
        { minimum: 6 }
      ]
    };
  testPass(6, schemaAllOf);
  testFail(5, schemaAllOf,
    {
      schemaPath: "/allOf/1/minimum",
      message: "Value 5 is less than minimum 6",
    });

  var schemaOneOf =
    {
      oneOf:
      [
        { type: "integer" },
        { minimum: 6 }
      ]
    };
  testPass(5, schemaOneOf);
  testFail(6, schemaOneOf,
    {
      schemaPath: "/oneOf",
      message: "Data is valid against more than one schema from \"oneOf\": indices 0 and 1",
    });

  var schemaAnyOf =
    {
      anyOf:
      [
        { type: "integer" },
        { minimum: 6 }
      ]
    };
  testPass(5, schemaAnyOf);
  testPass(6, schemaAnyOf);

  var schemaNot = { not: { type: "string" } };
  testPass(1, schemaNot);
  testFail("test", schemaNot);

  var schemaRealWorld =
    {
      "type": "object",
      "required": ["title", "origin", "variety", "process", "roast", "bag"],
      "properties": {
        "title": { "type": "string" },
        "origin": { "type": "string" },
        "variety": { "type": "array" },
        "process": { "type": "string" },
        "bag": { "$ref": "#/definitions/bag" },
        "roast": { "$ref": "#/definitions/roast" },
        "brew_tip": { "$ref": "#/definitions/brew_tip" }
      },
      "definitions": {
        "roast": {
          "type": "object",
          "required": ["level", "date"],
          "properties": {
            "level": { "type": "integer" },
            "date": {
              "type": "string",
              "pattern": /^\d{2}([./-])\d{2}\1\d{4}$/
            }
          }
        },
        "bag": {
          "type": "object",
          "required": ["weight", "date"],
          "properties": {
            "weight": { "type": "number" },
            "date": {
              "type": "string",
              "pattern": /^\d{2}([./-])\d{2}\1\d{4}$/
            }
          }
        },
        "brew_tip": {
          "type": "object",
          "required": ["method", "grind", "vessle"],
          "properties": {
            "method": { "type": "string" },
            "grind": { "type": "string" },
            "vessel": { "type": "string" }
          }
        }
      }
    };
  testPass(
    {
      "title": "Kapsokisio",
      "origin": "Kenya",
      "variety": ["SL28", "SL34", "Burbon"],
      "process": "Washed",
      "roast":
      {
        "level": 4,
        "date": "08.02.2012"
      },
      "bag":
      {
        "weight": 354,
        "date": "08.02.2012"
      },
      "brew_tip":
      {
        "method": "pourover",
        "grind": "medium",
        "vessle": "chemex"
      }
    },
    schemaRealWorld);
}

if (require.main === module) {
  runTests();

  test.showResults();
}