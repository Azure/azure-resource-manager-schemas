var test = require("./test.js");
var path = require("path");

var testFiles =
  [
    "Tests/assertTests.js",
    "Tests/tv4Tests.js",
    "Tests/validateJSONTests.js",
    "Tests/utilitiesTests.js",
  ];

function resolve(filePath) {
  return path.join(__dirname, filePath);
}

function runTestFile(testFilePath) {
  require(testFilePath).runTests();
}

function runAndReportTestsAsOneRun() {
  for (var index in testFiles) {
    runTestFile(resolve(testFiles[index]));
  }

  test.showResults();
}

function runAndReportTestsIndividually() {
  for (var index in testFiles) {
    test.resetResults();

    console.log(testFiles[index] + ":");
    runTestFile(resolve(testFiles[index]));
    test.showResults();
    console.log();
  }
}

module.exports.runTests = runTests;
function runTests() {
  //runAndReportTestsAsOneRun();
  runAndReportTestsIndividually();
}

if (require.main === module) {
  runTests();
}