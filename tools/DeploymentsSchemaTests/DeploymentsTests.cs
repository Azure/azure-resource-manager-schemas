using FluentAssertions;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.IO;

namespace DeploymentsSchemaTests
{
    [TestClass]
    public class DeploymentsTests
    {
        [TestMethod]
        public void TestSchemaLoader()
        {
            Action createAssemblyFunc = () =>
                TestSchemaCache.CreateFromFilePaths(
                    filePaths: Directory.EnumerateFiles(
                        path: "schemas",
                        searchPattern: "*.json",
                        searchOption: SearchOption.AllDirectories));
            createAssemblyFunc.Should().NotThrow();
        }
    }
}
