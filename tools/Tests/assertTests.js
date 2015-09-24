var assert = require("../assert.js");
var test = require("../test.js");

module.exports.runTests = runTests;
function runTests()
{
	test.run(function() { assert.True(true); });
	test.run(function() { assert.Throws(function() { assert.True(false); }); });
	
	test.run(function() { assert.False(false); });
	test.run(function() { assert.Throws(function() { assert.False(true); }); });
	
	test.run(function() { assert.Null(null); });
	test.run(function() { assert.Throws(function() { assert.Null(""); }); });
	test.run(function() { assert.Throws(function() { assert.Null(50); }); });
	test.run(function() { assert.Throws(function() { assert.Null(true); }); });
	test.run(function() { assert.Throws(function() { assert.Null({}); }); });
}

if(require.main === module)
{
	runTests();
	
	test.showResults();
}