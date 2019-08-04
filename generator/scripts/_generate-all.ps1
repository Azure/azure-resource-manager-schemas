$ErrorActionPreference  = "stop"
. $PSScriptRoot/shared.ps1
. $PSScriptRoot/constants.ps1
. $PSScriptRoot/git-helpers.ps1
. $PSScriptRoot/specs-helpers.ps1
. $PSScriptRoot/generate-helpers.ps1

$basePaths = CloneAndGenerateBasePaths -localPath $restSpecsRepoPath -remoteUri $restSpecsRepoUri -commitHash $restSpecsRepoCommitHash

$readmes = ListReadmePaths -specsPath $restSpecsRepoPath -basePaths $basePaths

foreach ($readme in $readmes) {
  GenerateSchemasForReadme -readme $readme
}