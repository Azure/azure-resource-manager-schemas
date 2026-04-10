// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using System;
using System.IO;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace TemplateSchemaGenerator;

public static class Utils
{
    public static string GetProviderNamespace(string resourceType)
        => resourceType.Split('/', 2)[0];
}
