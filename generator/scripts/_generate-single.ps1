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

CloneAndGenerateBasePaths -localPath $restSpecsRepoPath -remoteUri $restSpecsRepoUri -commitHash $restSpecsRepoCommitHash | Out-Null

try {
  $readme = ValidateUserProvidedReadme -basePath $BasePath
} catch {
  throw "Unable to find a readme under '$BasePath'. Please try running 'npm run list-basepaths' to find the list of valid paths."
}

GenerateSchemasForReadme -readme $readme