$ErrorActionPreference  = "stop"
. $PSScriptRoot/shared.ps1

Function ResetGitDirectory {
  Param(
    $localPath
  )

  In $localPath {
    Log-Info "Cleaning git repo in $localPath"

    & git reset . >$null
    if (-not $?) {
      Remove-Item -Recurse -Force $localPath
      throw "Failed to clean git repo in $localPath"
    }

    & git checkout -- . >$null
    if (-not $?) {
      Remove-Item -Recurse -Force $localPath
      throw "Failed to clean git repo in $localPath"
    }

    & git clean -fd . >$null
    if (-not $?) {
      Remove-Item -Recurse -Force $localPath
      throw "Failed to clean git repo in $localPath"
    }
  }
}


Function CloneGitRepo {
  Param(
    $localPath,
    $remoteUri,
    $commitHash
  )

  $localRepoExists = (Test-Path $localPath);
  if ($localRepoExists) {
    Log-Info "Running fsck for $remoteUri"
    In $localPath {
      & git fsck >$null
    }
    if (-not $?) {
      Remove-Item -Recurse -Force $localPath
      $localRepoExists = $false;
      Log-Info "Failed fsck for $remoteUri"
    }
  }
  
  if (-not $localRepoExists) {
    Log-Info "Cloning from $remoteUri"
    New-Item -Type Directory -Force -Path $localPath | Out-Null
    & git clone $remoteUri $localPath >$null
    if (-not $?) {
      Remove-Item -Recurse -Force $localPath
      throw "Failed to clone $remoteUri"
    }
  }
  
  In $localPath {
    Log-Info "Fetching from $remoteUri"
    & git fetch >$null
    if (-not $?) {
      Remove-Item -Recurse -Force $localPath
      throw "Failed to fetch from $remoteUri"
    }

    ResetGitDirectory -localPath $localPath
  
    Log-Info "Checking out commit hash $commitHash"
    & git checkout $commitHash >$null
    if (-not $?) {
      Remove-Item -Recurse -Force $localPath
      throw "Failed to checkout commit hash $commitHash"
    }
  }
}