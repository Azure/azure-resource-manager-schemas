#!/usr/bin/env pwsh

$ErrorActionPreference = "Stop"
$root = Join-Path $PSScriptRoot "../" -Resolve

dotnet publish "$root/src/TemplateSchemaGenerator"

npm --prefix "$root/generator" ci
npm --prefix "$root/generator" run generate-all -- `
  --specs-dir "$root/../azure-rest-api-specs" `
  --csharp-only