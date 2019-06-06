$ErrorActionPreference  = "stop"
. $PSScriptRoot/shared.ps1
. $PSScriptRoot/constants.ps1

$localRepoExists = (Test-Path $restSpecsRepoPath);
if ($localRepoExists) {
  => "Running fsck for $restSpecsRepoUri"
  in $restSpecsRepoPath {
    git fsck;
  }
  if (-not $?) {
    Remove-Item -recurse -force $restSpecsRepoPath
    $localRepoExists = $false;
    /$ "Failed fsck for $restSpecsRepoUri"
  }
}

if (-not $localRepoExists) {
  => "Cloning from $restSpecsRepoUri"
  mkdir -ea 0  $restSpecsRepoPath
  git clone $restSpecsRepoUri $restSpecsRepoPath
  if (-not $?) {
    Remove-Item -recurse -force $restSpecsRepoPath
    /! "Failed to clone $restSpecsRepoUri"
  }
}

in $restSpecsRepoPath {
  => "Fetching from $restSpecsRepoUri"
  git fetch;
  if (-not $?) {
    Remove-Item -recurse -force $restSpecsRepoPath
    /! "Failed to fetch from $restSpecsRepoUri"
  }

  => "Cleaning local repo"
  git clean -xfd .;
  if (-not $?) {
    Remove-Item -recurse -force $restSpecsRepoPath
    /! "Failed to clean local repo"
  }

  => "Checking out commit hash $restSpecsRepoCommitHash"
  git checkout $restSpecsRepoCommitHash;
  if (-not $?) {
    Remove-Item -recurse -force $restSpecsRepoPath
    /! "Failed to checkout commit hash $restSpecsRepoCommitHash"
  }
}