Param (
  [Parameter(Mandatory=$true)]
  $ProviderNamespace,
  [Parameter(Mandatory=$true)]
  $ApiVersion
)

$ErrorActionPreference  = "stop"
. $PSScriptRoot/shared.ps1
. $PSScriptRoot/constants.ps1
. $PSScriptRoot/git-helpers.ps1
. $PSScriptRoot/generate-helpers.ps1

## ===========================================================================
# script

CloneGitRepo -localPath $restSpecsRepoPath -remoteUri $restSpecsRepoUri -commitHash $restSpecsRepoCommitHash

ResetGitDirectory -localPath $schemasBasePath

$tmpGuid = [guid]::NewGuid()
$tmpFolder = "$tmpRoot/generated_$tmpGuid"
$modulePath = Get-ChildItem -Recurse -Directory -Path "$restSpecsRepoPath/specification" `
  | Where-Object { $_.Name -eq $ApiVersion } `
  | Where-Object { $_.Parent.Parent.Name -eq $ProviderNamespace }

if ($modulePath.Count -ne 1) {
  throw "Expected 1 file, found $($modulePath.Count)"
}

try {
  Log-Info "Start processing $modulePath"

  $outputFile = GenerateSchema -modulePath $modulePath -tmpFolder $tmpFolder -expectedApiVersion $ApiVersion
  
  $schemaRefs = GenerateSchemaRefs -modulePath $modulePath -outputFile $outputFile -expectedNamespace $ProviderNamespace -expectedApiVersion $ApiVersion

  SaveToSchemasDirectory -outputFile $outputFile -schemaRefs $schemaRefs -namespace $ProviderNamespace -apiVersion $ApiVersion

  Log-Info "Finished processing $modulePath"
}
finally {
  Remove-Item -Recurse $tmpFolder -ErrorAction Ignore
}