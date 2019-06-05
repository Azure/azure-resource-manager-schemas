$ErrorActionPreference  = "stop"
. $PSScriptRoot/shared.ps1
. $PSScriptRoot/constants.ps1

## ===========================================================================
# script

Get-ChildItem -Recurse -Directory -Path "$restSpecs/specification" `
  | Where-Object { $_.Name -match "^\d{4}-\d{2}-\d{2}(|-preview)$" } `
  | Foreach-Object { $_.Parent.Parent } `
  | Where-Object { $_.Parent.Name -eq "resource-manager" } `
  | Get-Unique `
  | ForEach-Object { "$($_.Parent.Parent.Name)/$($_.Parent.Name)/$($_.Name)" }