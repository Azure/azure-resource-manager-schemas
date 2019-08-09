$ErrorActionPreference  = "stop"
. $PSScriptRoot/shared.ps1
. $PSScriptRoot/constants.ps1

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

Function GenerateSchemasForReadme {
  Param(
    $readme
  )

  $apiVersions = Get-ChildItem -Recurse -Directory -Path (Resolve-Path "$readme/..") `
  | Where-Object { $_.Name -match "^\d{4}-\d{2}-\d{2}(|-preview)$" } `
  | ForEach-Object { $_.Name }

  Log-Info "Processing '$readme' with api-versions: $($apiVersions -join ', ')"

  foreach ($apiVersion in $apiVersions) {
    $tmpGuid = [guid]::NewGuid()
    $tmpFolder = ResolvePath "$tmpRoot/schm_$tmpGuid"
    
    try {
      GenerateSchema -readme $readme -tmpFolder $tmpFolder -apiVersion $apiVersion
  
      $generatedSchemas = GetGeneratedSchemas -tmpFolder $tmpFolder
    
      foreach ($generatedSchema in $generatedSchemas) {
        $namespace = $generatedSchema.BaseName
        $apiVersion = $generatedSchema.Directory.Name
    
        $schemaRefs = GenerateSchemaRefs -outputFile $generatedSchema -namespace $namespace -apiVersion $apiVersion
    
        SaveToSchemasDirectory -outputFile $generatedSchema -schemaRefs $schemaRefs -namespace $namespace -apiVersion $apiVersion
      }
    }
    finally {
      Remove-Item -Recurse $tmpFolder -ErrorAction Ignore
    }
  }
}

Function GenerateSchema {
  Param(
    $readme,
    $tmpFolder,
    $apiVersion
  )

  $autoRestParams = @(
    "--azureresourceschema";
    "--output-folder=$tmpFolder";
    "--api-version=$apiVersion";
    "--title=none";
    $readme;
  )

  if ($autoRestVerboseOutput) {
    $autoRestParams += "--verbose"
  }

  ExecAutoRest -params $autoRestParams
}

Function GetGeneratedSchemas {
  Param(
    $tmpFolder
  )

  return Get-ChildItem -File -Recurse "$tmpFolder" -Filter "*.json"
}

Function GenerateSchemaRefs {
  Param(
    $outputFile,
    $namespace,
    $apiVersion
  )

  $outputSchemaUri = "$schemasBaseUri/$apiVersion/$namespace.json"
  $outputContents = Get-Content -Path $outputFile | ConvertFrom-Json
  $resourceTypes = $outputContents.resourceDefinitions.PSObject.Properties `
    | ForEach-Object { $_.Value.description }
  $schemaRefs = $outputContents.resourceDefinitions.PSObject.Properties `
    | ForEach-Object { $_.Name } `
    | Foreach-Object { "$outputSchemaUri#/resourceDefinitions/$_"}

  Log-Info "================================================================================================================================"

  Log-Info -NoNewLine "Filename: "
  Log-Action $outputFile

  Log-Info -NoNewLine "Provider Namespace: "
  Log-Action $namespace

  Log-Info -NoNewLine "API Version: "
  Log-Action $apiVersion

  Log-Info "Resource Types: "

  $resourceTypes | Foreach-Object {
    Log-Info -NoNewLine "- "
    Log-Action $_
  }

  Log-Info "Resource References: "

  $schemaRefs | Foreach-Object {
    Log-Info -NoNewLine "- "
    Log-Action $_
  }

  Log-Info "================================================================================================================================"

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

  # workaround for https://github.com/PowerShell/PowerShell/issues/8824
  $newRefsArray = [System.Collections.ArrayList]@($newRefs | Get-Unique)
  $newRefsArray.Sort([System.StringComparer]::OrdinalIgnoreCase)

  foreach ($schemaRef in $newRefsArray) {
    $templateContents.allOf[1].oneOf += @{
      '$ref' = $schemaRef
    }
  }

  New-Item -Type Directory -Force -Path "$schemasBasePath/$apiVersion" | Out-Null
  Copy-Item -Path $outputFile -Destination $outputSchemaPath -Force -Recurse
  $templateContents | ConvertTo-Json -Depth 10 > $generatedSchemasPath
}