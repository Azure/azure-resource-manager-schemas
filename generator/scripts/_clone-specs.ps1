$ErrorActionPreference  = "stop"
. $PSScriptRoot/shared.ps1
. $PSScriptRoot/constants.ps1
. $PSScriptRoot/git-helpers.ps1

CloneGitRepo -localPath $restSpecsRepoPath -remoteUri $restSpecsRepoUri -commitHash $restSpecsRepoCommitHash