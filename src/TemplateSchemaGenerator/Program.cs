// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using System;
using System.Diagnostics;
using CommandLine;
using System.IO.Abstractions;

namespace TemplateSchemaGenerator;

public class CommandLineOptions
{
    public CommandLineOptions(string sourceFolder, string outputFolder, string providerNamespace, bool verbose)
    {
        SourceFolder = sourceFolder;
        OutputFolder = outputFolder;
        ProviderNamespace = providerNamespace;
        Verbose = verbose;
    }

    [Option("source-folder", Required = true, HelpText = "The path to the 'generated' folder in the bicep-types-az repo")]
    public string SourceFolder { get; }

    [Option("output-folder", Required = true, HelpText = "The path to the output folder")]
    public string OutputFolder { get; }

    [Option("provider-namespace", Required = false, HelpText = "The provider namespace to generate")]
    public string ProviderNamespace { get; }

    [Option("verbose", Required = false, HelpText = "Enable verbose tracing")]
    public bool Verbose { get; }
}

internal static class Program
{
    public static int Main(string[] args)
    {
        return Parser.Default.ParseArguments<CommandLineOptions>(args)
            .MapResult(Run, errors =>
            {
                foreach (var error in errors)
                {
                    Console.Error.WriteLine(error.ToString());
                }

                return 1;
            });
    }

    private static int Run(CommandLineOptions options)
    {
        if (options.Verbose)
        {
            Trace.Listeners.Add(new TextWriterTraceListener(Console.Out));
        }

        FileSystem fileSystem = new();
        MainGenerator generator = new(fileSystem, new(fileSystem, options.SourceFolder));

        generator.Generate(new(options.OutputFolder, options.ProviderNamespace));

        return 0;
    }
}
