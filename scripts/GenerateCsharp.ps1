#!/usr/bin/env pwsh

param(
    [Parameter(Mandatory = $false)]
    [string]$ProviderNamespace)

$ErrorActionPreference = "Stop"
$root = Join-Path $PSScriptRoot "../" -Resolve

dotnet publish "$root/src/TemplateSchemaGenerator"

npm --prefix "$root/generator" ci

if ($ProviderNamespace) {
  npm --prefix "$root/generator" run generate -- `
    --provider-namespace $ProviderNamespace
} else {
  npm --prefix "$root/generator" run generate
}