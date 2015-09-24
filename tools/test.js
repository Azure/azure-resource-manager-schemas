var testsPassed = 0;
var testFailures = [];

module.exports.run = run;
function run(testFunction)
{
	try
	{
		testFunction();
		++testsPassed;
	}
	catch(e)
	{
		testFailures.push(e.stack);
	}
}

module.exports.resetResults = resetResults;
function resetResults()
{
	testsPassed = 0;
	testFailures = [];
}

module.exports.showResults = showResults;
function showResults()
{
	console.log(testsPassed + " tests passed");
	console.log(testFailures.length + " tests failed");
	for(var index in testFailures)
	{
		if(1 <= index)
		{
			console.log();
		}
		
		console.log(testFailures[index]);
	}
}