using FluentAssertions;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.IO;

namespace deploymentsSchemaTests
{
    [TestClass]
    public class DeploymentsTests
    {
        [TestMethod]
        public void TestSchemaLoader()
        {
            // Calling Path.Combine to construct the path to schemas folder
            var schemasPath = Path.Combine(new string[] { "..", "..", "..", "..", "..", "schemas" });
            Action createAssemblyFunc = () =>
                TestSchemaCache.CreateFromFilePaths(
                    filePaths: Directory.EnumerateFiles(
                        path: schemasPath,
                        searchPattern: "*.json",
                        searchOption: SearchOption.AllDirectories));
            createAssemblyFunc.Should().NotThrow();
        }
    }
}
