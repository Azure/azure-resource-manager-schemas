var assert = require("../assert.js");
var test = require("../test.js");

module.exports.runTests = runTests;
function runTests()
{
    // assert.True() tests
    test.run(function () { assert.True(true); });
    test.run(function () { assert.Throws(function() { assert.True(false); }); });
            
    // assert.False() tests
    test.run(function () { assert.False(false); });
    test.run(function () { assert.Throws(function () { assert.False(true); }); });
              
    // assert.Null() tests
    test.run(function () { assert.Null(null); });
    test.run(function () { assert.Throws(function () { assert.Null(""); }); });
    test.run(function () { assert.Throws(function () { assert.Null(50); }); });
    test.run(function () { assert.Throws(function () { assert.Null(true); }); });
    test.run(function () { assert.Throws(function () { assert.Null({}); }); });

    // assert.Empty() tests
    test.run(function () { assert.Empty(null); });
    test.run(function () { assert.Empty(); });
    test.run(function () { assert.Empty([]); });
    test.run(function () { assert.Throws(function () { assert.Empty([1, 2, 3]); }) });

    // assert.Equal() tests
    test.run(function () { assert.Equal(null, null); });
    test.run(function () { assert.Equal(); });
    test.run(function () { assert.Equal(1, 1); });
    test.run(function () { assert.Equal("1", "1"); });
    test.run(function () { assert.Throws(function () { assert.Equal(1, "1"); }); });
    test.run(function () { assert.Equal({ "name": "Dan" }, { "name": "Dan" }); });
    test.run(function () { assert.Throws(function () { assert.Equal({}, { "name": "Dan" }); }) });
    test.run(function () { assert.Equal([], []); });
    test.run(function () { assert.Equal([1], [1]); });
    test.run(function () { assert.Throws(function () { assert.Equal([1], [1, 2]); }); });
    test.run(function () { assert.Equal({ "a": { "b": "bValue" } }, { "a": { "b": "bValue" } }); });
    test.run(function () { assert.Throws(function () { assert.Equal({ "a": { "b": "bValue" } }, { "a": { "b": "notBValue" } }); }); });
}

if(require.main === module)
{
    runTests();
    
    test.showResults();
}