$ErrorActionPreference  = "stop"
. $PSScriptRoot/shared.ps1

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
      git fsck | Out-Host
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
    git clone $remoteUri $localPath
    if (-not $?) {
      Remove-Item -Recurse -Force $localPath
      Log-Error "Failed to clone $remoteUri"
    }
  }
  
  In $localPath {
    Log-Info "Fetching from $remoteUri"
    git fetch | Out-Host
    if (-not $?) {
      Remove-Item -Recurse -Force $localPath
      Log-Error "Failed to fetch from $remoteUri"
    }
  
    Log-Info "Cleaning local repo"
    git clean -xfd . | Out-Host
    if (-not $?) {
      Remove-Item -Recurse -Force $localPath
      Log-Error "Failed to clean local repo"
    }
  
    Log-Info "Checking out commit hash $commitHash"
    git checkout $commitHash | Out-Host
    if (-not $?) {
      Remove-Item -Recurse -Force $localPath
      Log-Error "Failed to checkout commit hash $commitHash"
    }
  }
}

Function ResetGitDirectory {
  Param(
    $localPath
  )

  In $localPath {
    Log-Info "Running git checkout in $localPath"
    git checkout -- . | Out-Host
    if (-not $?) {
      Log-Error "Failed to run git checkout in $localPath"
    }
  
    Log-Info "Running git clean in $localPath"
    git clean -xfd . | Out-Host
    if (-not $?) {
      Log-Error "Failed to run git clean in $localPath"
    }
  }
}