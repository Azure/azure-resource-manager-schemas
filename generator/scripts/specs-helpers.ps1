$ErrorActionPreference  = "stop"
. $PSScriptRoot/shared.ps1
. $PSScriptRoot/constants.ps1
. $PSScriptRoot/git-helpers.ps1

Function CloneAndConfigureSpecs {
  Param(
    $localPath,
    $remoteUri,
    $commitHash
  )

  CloneGitRepo -localPath $localPath -remoteUri $remoteUri -commitHash $commitHash

  In $localPath {
    Log-Info "Generating multi-api files in $localPath"

    & npm install >$null
    if (-not $?) {
      throw "Failed to run 'npm install' in $localPath"
    }

    & npm run multiapi >$null
    if (-not $?) {
      throw "Failed to run 'npm run multiapi' in $localPath"
    }
  }

  In "$localPath/specification" {
    return Get-ChildItem -File -Recurse -Include 'readme.enable-multi-api.md' -Path '.' ` `
    | ForEach-Object { $_.Directory } `
    | Resolve-Path -Relative `
    | Where-Object { $_ -match 'resource-manager' }
  }
}

Function GetWhitelistedPaths {
  Param(
    $specsPath,
    $basePaths
  )

  In "$specsPath/specification" {
    $whitelistedPaths = $whitelist | Resolve-Path -Relative
    $basePaths = $basePaths | Resolve-Path -Relative

    return $basePaths | Where-Object { $_ -in $whitelistedPaths }
  }
}

Function ValidateUserProvidedReadme {
  Param(
    $readmePath
  )

  In "$restSpecsRepoPath/specification" {
    $readme = Join-Path -Path ($readmePath | Resolve-Path) -ChildPath 'readme.enable-multi-api.md'

    if (-not (Test-Path $readme)) {
      throw "Unable to find readme '$readme' in specs repo"
    }

    return $readme
  }
}

Function ValidateAndGetWhitelistedReadmes {
  Param(
    $readmePaths
  )

  In "$restSpecsRepoPath/specification" {
    $whitelistedPaths = $whitelist | Resolve-Path -Relative
  
    foreach ($whitelistPath in $whitelistedPaths) {
      if ($whitelistPath -notin $readmePaths) {
        throw "Unable to find whitelisted path '$whitelistPath' in specs repo"
      }
    }

    return Join-Path -Path ($whitelistedPaths | Resolve-Path) -ChildPath 'readme.enable-multi-api.md'
  }
}

Function GetBasePathString {
  Param(
    $specsPath,
    $basePath
  )

  In "$specsPath/specification" {
    $curPath = $basePath | Resolve-Path -Relative

    $paths = @()
    do {
      $paths += (Split-Path $curPath -Leaf)
    } while (($curPath = Split-Path $curPath -Parent))

    [System.Array]::Reverse($paths)

    return ($paths | Select-Object -Skip 1) -join '/'
  }
}