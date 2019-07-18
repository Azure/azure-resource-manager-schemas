$ErrorActionPreference  = "stop"
. $PSScriptRoot/shared.ps1
. $PSScriptRoot/constants.ps1
. $PSScriptRoot/git-helpers.ps1
. $PSScriptRoot/specs-helpers.ps1
. $PSScriptRoot/generate-helpers.ps1

$readmePaths = CloneAndConfigureSpecs -localPath $restSpecsRepoPath -remoteUri $restSpecsRepoUri -commitHash $restSpecsRepoCommitHash

$readmes = ValidateAndGetWhitelistedReadmes -readmePaths $readmePaths

foreach ($readme in $readmes) {
  $tmpGuid = [guid]::NewGuid()
  $tmpFolder = ResolvePath "$tmpRoot/schm_$tmpGuid"

  try {
    $apiVersions = Get-ChildItem -Recurse -Directory -Path (Resolve-Path "$readme/..") `
    | Where-Object { $_.Name -match "^\d{4}-\d{2}-\d{2}(|-preview)$" } `
    | ForEach-Object { $_.Name }
  
    Log-Info "Processing '$readme' with api-versions: $($apiVersions -join ', ')"
  
    foreach ($apiVersion in $apiVersions) {
      GenerateSchema -readme $readme -tmpFolder $tmpFolder -apiVersion $apiVersion
    }
  
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