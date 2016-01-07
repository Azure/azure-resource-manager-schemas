var clc = require("cli-color");

var testsPassed = 0;
var testFailures = 0;

module.exports.run = run;
function run(testFunction) {
  try {
    testFunction();
    ++testsPassed;
  }
  catch (e) {
    console.log(clc.red(e.stack));
    ++testFailures;
  }
}

module.exports.resetResults = resetResults;
function resetResults() {
  testsPassed = 0;
  testFailures = 0;
}

module.exports.showResults = showResults;
function showResults() {
  console.log(testsPassed + " tests passed");
  console.log(testFailures + " tests failed");
}