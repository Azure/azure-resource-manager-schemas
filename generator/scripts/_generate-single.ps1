Param (
  [Parameter(Mandatory=$true)]
  $BasePath
)

$ErrorActionPreference  = "stop"
. $PSScriptRoot/shared.ps1
. $PSScriptRoot/constants.ps1
. $PSScriptRoot/git-helpers.ps1
. $PSScriptRoot/specs-helpers.ps1
. $PSScriptRoot/generate-helpers.ps1

CloneAndConfigureSpecs -localPath $restSpecsRepoPath -remoteUri $restSpecsRepoUri -commitHash $restSpecsRepoCommitHash | Out-Null

try {
  $readme = ValidateUserProvidedReadme -readmePath $BasePath
} catch {
  throw "Unable to find a readme under '$BasePath'. Please try running 'npm run list-readmes' to find the list of valid paths."
}

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