$ErrorActionPreference  = "stop"
. $PSScriptRoot/shared.ps1
. $PSScriptRoot/constants.ps1
. $PSScriptRoot/git-helpers.ps1
. $PSScriptRoot/generate-helpers.ps1

## ===========================================================================
# script

CloneGitRepo -localPath $restSpecsRepoPath -remoteUri $restSpecsRepoUri -commitHash $restSpecsRepoCommitHash

ResetGitDirectory -localPath $schemasBasePath

$allModulePaths = @()
foreach ($moduleBasePath in $apiVersionWhitelist.Keys) {
  $fullModulePath = "$restSpecsRepoPath/specification/$moduleBasePath"
  if (-not (Test-Path $fullModulePath)) {
    Log-Error "Failed to locate module in $fullModulePath"
  }

  $foundModulePaths = Get-ChildItem -Recurse -Directory -Path "$fullModulePath" | Where-Object { $_.Name -match "^\d{4}-\d{2}-\d{2}(|-preview)$" }

  if (-not ($apiVersionWhitelist[$moduleBasePath] -contains '*')) {
    $foundModulePaths = $foundModulePaths | Where-Object { $apiVersionWhitelist[$moduleBasePath] -contains $_.Name }
    $foundApiVersions = $foundModulePaths | ForEach-Object { $_.Name }

    foreach ($apiVersion in $apiVersionWhitelist[$moduleBasePath]) {
      if (-not ($foundApiVersions -contains $apiVersion)) {
        Log-Error "Failed to locate api version $apiVersion in module $fullModulePath"
      }
    }
  }

  $allModulePaths += $foundModulePaths
}

foreach ($modulePath in $allModulePaths) {
  $tmpGuid = [guid]::NewGuid()
  $tmpFolder = "$tmpRoot/generated_$tmpGuid"
  $apiVersion = $modulePath.Name
  $namespace = $modulePath.Parent.Parent.Name

  try {
    Log-Info "Start processing $modulePath"

    $outputFile = GenerateSchema -modulePath $modulePath -tmpFolder $tmpFolder -expectedApiVersion $apiVersion
    
    $schemaRefs = GenerateSchemaRefs -modulePath $modulePath -outputFile $outputFile -expectedNamespace $namespace -expectedApiVersion $apiVersion

    SaveToSchemasDirectory -outputFile $outputFile -schemaRefs $schemaRefs -namespace $namespace -apiVersion $apiVersion

    Log-Info "Finished processing $modulePath"
  }
  catch {
    Log-Error "Caught error processing $($modulePath): $_"
  }
  finally {
    Remove-Item -Recurse $tmpFolder -ErrorAction Ignore
  }
}