$ErrorActionPreference  = "stop"
. $PSScriptRoot/shared.ps1
. $PSScriptRoot/constants.ps1
. $PSScriptRoot/git-helpers.ps1
. $PSScriptRoot/specs-helpers.ps1

$basePaths = CloneAndConfigureSpecs -localPath $restSpecsRepoPath -remoteUri $restSpecsRepoUri -commitHash $restSpecsRepoCommitHash

$whitelistedPaths = GetWhitelistedPaths -specsPath $restSpecsRepoPath -basePaths $basePaths

foreach ($basePath in $basePaths) {
  $isWhitelisted = ($basePath -in $whitelistedPaths)
  $basePathString = GetBasePathString -specsPath $restSpecsRepoPath -basePath $basePath

  Log-Info -NoNewline "Discovered '"
  Log-Action -NoNewline $basePathString
  Log-Info -NoNewline "'. Whitelisted for auto-generation: "
  Log-Action -NoNewline $isWhitelisted
  Log-Info "."
}