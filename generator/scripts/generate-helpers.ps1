$ErrorActionPreference  = "stop"
. $PSScriptRoot/shared.ps1
. $PSScriptRoot/constants.ps1

## ===========================================================================
# script

Function ExecAutoRest {
  Param(
    $params
  )

  Log-Info "Running autorest $params"
  autorest $params | Out-Host

  if (-not $?) {
    throw "Autorest failed for module $modulePath"
  }
}

Function GenerateSchema {
  Param(
    $modulePath,
    $tmpFolder,
    $expectedApiVersion
  )

  $jsonSpecs = Get-ChildItem -File -Recurse -Include '*.json' -Path $modulePath `
    | Where-Object { (Get-Content -Path $_ | ConvertFrom-Json -AsHashTable).swagger -eq "2.0" }

  if ($jsonSpecs.Count -eq 0) {
    throw "Unable to find any swagger specs in $modulePath"
  }

  $autoRestParams = @(
    "--use=$autoRestGenerator",
    "--clear-output-folder"
    "--output-folder=$tmpFolder",
    "--api-version=$expectedApiVersion",
    "--azureresourceschema",
    "--title=none"
  )

  if ($autoRestVerboseOutput) {
    $autoRestParams += "--verbose"
  }

  foreach ($jsonSpec in $jsonSpecs) {
    $autoRestParams += "--input-file=$jsonSpec"
  }

  ExecAutoRest -params $autoRestParams

  $outputFile = Get-ChildItem -File -Recurse "$tmpFolder"
  if ($outputFile.Count -ne 1) {
    throw "Expected 1 file, found $($outputFile.Count)"
  }

  return $outputFile
}

Function GenerateSchemaRefs {
  Param(
    $modulePath,
    $outputFile,
    $expectedNamespace,
    $expectedApiVersion
  )

  $outputNamespace = $outputFile.BaseName
  if (($expectedNamespace -ne $outputNamespace)) {
    throw "Mismatch between namespace. Expected: $expectedNamespace, Generated: $outputNamespace"
  }

  $outputApiVersion = $outputFile.Directory.Name
  if (($expectedApiVersion -ne $outputApiVersion)) {
    throw "Mismatch between api version. Expected: $expectedApiVersion, Generated: $outputApiVersion"
  }

  $outputSchemaUri = "$schemasBaseUri/$expectedApiVersion/$expectedNamespace.json"
  $outputContents = Get-Content -Path $outputFile | ConvertFrom-Json
  $resourceTypes = $outputContents.resourceDefinitions.PSObject.Properties `
    | ForEach-Object { $_.Value.description }
  $schemaRefs = $outputContents.resourceDefinitions.PSObject.Properties `
    | ForEach-Object { $_.Name } `
    | Foreach-Object { "$outputSchemaUri#/resourceDefinitions/$_"}

  Log-Info "Provider namespace: $outputNamespace"
  Log-Info "API version: $outputApiVersion"
  Log-Info "Resource types:"
  $resourceTypes | Foreach-Object { Log-Info "- $_" }
  Log-Info "Resource references:"
  $schemaRefs | Foreach-Object { Log-Info "- $_" }

  return $schemaRefs
}

Function SaveToSchemasDirectory {
  Param(
    $outputFile,
    $schemaRefs,
    $namespace,
    $apiVersion
  )

  $outputSchemaUri = "$schemasBaseUri/$apiVersion/$namespace.json"
  $outputSchemaPath = "$schemasBasePath/$apiVersion/$namespace.json"

  $templateContents = Get-Content -Path $generatedSchemasTemplatePath | ConvertFrom-Json
  $actualContents = Get-Content -Path $generatedSchemasPath | ConvertFrom-Json
  $currentRefs = $actualContents.allOf[1].oneOf | ForEach-Object { $_.'$ref' }

  $newRefs = @()
  $newRefs += $currentRefs | Where-Object { $_ -notlike "$outputSchemaUri*" }
  $newRefs += $schemaRefs
  $newRefs = $newRefs | Get-Unique

  foreach ($schemaRef in $newRefs) {
    $templateContents.allOf[1].oneOf += @{
      '$ref' = $schemaRef
    }
  }

  New-Item -Type Directory -Force -Path "$schemasBasePath/$apiVersion" | Out-Null
  Copy-Item -Path $outputFile -Destination $outputSchemaPath -Force -Recurse
  $templateContents | ConvertTo-Json -Depth 10 > $generatedSchemasPath
}