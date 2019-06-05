$ErrorActionPreference  = "stop"
. $PSScriptRoot/shared.ps1
. $PSScriptRoot/constants.ps1

$localRepoExists = (Test-Path $restSpecs);
if ($localRepoExists) {
  => "Running fsck for $restSpecsRepoUri"
  in $restSpecs {
    git fsck;
  }
  if (-not $?) {
    Remove-Item -recurse -force $restSpecs
    $localRepoExists = $false;
    /$ "Failed fsck for $restSpecsRepoUri"
  }
}

if (-not $localRepoExists) {
  => "Cloning from $restSpecsRepoUri"
  mkdir -ea 0  $restSpecs
  git clone $restSpecsRepoUri $restSpecs
  if (-not $?) {
    Remove-Item -recurse -force $restSpecs
    /! "Failed to clone $restSpecsRepoUri"
  }
}

in $restSpecs {
  => "Fetching from $restSpecsRepoUri"
  git fetch;
  if (-not $?) {
    Remove-Item -recurse -force $restSpecs
    /! "Failed to fetch from $restSpecsRepoUri"
  }

  => "Cleaning local repo"
  git clean -xfd .;
  if (-not $?) {
    Remove-Item -recurse -force $restSpecs
    /! "Failed to clean local repo"
  }

  => "Checking out commit hash $restSpecsRepoCommitHash"
  git checkout $restSpecsRepoCommitHash;
  if (-not $?) {
    Remove-Item -recurse -force $restSpecs
    /! "Failed to checkout commit hash $restSpecsRepoCommitHash"
  }
}