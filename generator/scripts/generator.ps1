$ErrorActionPreference  = "stop"
. $PSScriptRoot/shared.ps1
. $PSScriptRoot/constants.ps1

## ===========================================================================
# script

Function ExecAutoRest {
  Param(
    $params
  )

  => "Running autorest $params"
  autorest $params | Write-Host

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
    | Where-Object { (Get-Content -Path $_ | ConvertFrom-Json).swagger -eq "2.0" }

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

  => "Provider namespace $outputNamespace"
  => "API version $outputApiVersion"
  => "Resource types: $resourceTypes"
  => "Resource references: $schemaRefs"

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

  Copy-Item -Path $outputFile -Destination $outputSchemaPath -Force -Recurse
  $templateContents | ConvertTo-Json -Depth 10 > $generatedSchemasPath
}

Function ResetSchemasDirectory {
  in $schemasBasePath {
    => "Running git checkout in $schemasBasePath"
    git checkout -- .;
    if (-not $?) {
      /! "Failed to run git checkout in $schemasBasePath"
    }
  
    => "Running git clean in $schemasBasePath"
    git clean -xfd .;
    if (-not $?) {
      /! "Failed to run git clean in $schemasBasePath"
    }
  }
}

Function ProcessAllSchemas {
  $allModulePaths = @()

  foreach ($moduleBasePath in $apiVersionWhitelist.Keys) {
    $fullModulePath = "$restSpecsRepoPath/specification/$moduleBasePath"
    if (-not (Test-Path $fullModulePath)) {
      /! "Failed to locate module in $fullModulePath"
    }
  
    $foundModulePaths = Get-ChildItem -Recurse -Directory -Path "$fullModulePath" | Where-Object { $_.Name -match "^\d{4}-\d{2}-\d{2}(|-preview)$" }
  
    if (-not ($apiVersionWhitelist[$moduleBasePath] -contains '*')) {
      $foundModulePaths = $foundModulePaths | Where-Object { $apiVersionWhitelist[$moduleBasePath] -contains $_.Name }
      $foundApiVersions = $foundModulePaths | ForEach-Object { $_.Name }
  
      foreach ($apiVersion in $apiVersionWhitelist[$moduleBasePath]) {
        if (-not ($foundApiVersions -contains $apiVersion)) {
          /! "Failed to locate api version $apiVersion in module $fullModulePath"
        }
      }
    }
  
    $allModulePaths += $foundModulePaths
  }
  
  foreach ($modulePath in $allModulePaths) {
    $tmpGuid = [guid]::NewGuid()
    $tmpFolder = "$tmp/generated_$tmpGuid"
    $apiVersion = $modulePath.Name
    $namespace = $modulePath.Parent.Parent.Name
  
    try {
      => "Start processing $modulePath"

      $outputFile = GenerateSchema -modulePath $modulePath -tmpFolder $tmpFolder -expectedApiVersion $apiVersion
      
      $schemaRefs = GenerateSchemaRefs -modulePath $modulePath -outputFile $outputFile -expectedNamespace $namespace -expectedApiVersion $apiVersion
  
      SaveToSchemasDirectory -outputFile $outputFile -schemaRefs $schemaRefs -namespace $namespace -apiVersion $apiVersion

      => "Finished processing $modulePath"
    }
    catch
    {
      /! "Caught error processing $($modulePath): $_"
    }
    finally {
      Remove-Item -Recurse $tmpFolder -ErrorAction Ignore
    }
  }
}

ResetSchemasDirectory

ProcessAllSchemas