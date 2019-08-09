$ErrorActionPreference  = "stop"
. $PSScriptRoot/shared.ps1
. $PSScriptRoot/constants.ps1
. $PSScriptRoot/git-helpers.ps1

Function CloneAndGenerateBasePaths {
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

Function ListReadmePaths {
  Param(
    $specsPath,
    $basePaths
  )

  GetWhitelistedPaths -specsPath $specsPath -basePaths $basePaths `
  | ForEach-Object { Join-Path -Path "$specsPath/specification" -ChildPath $_ } `
  | ForEach-Object { Join-Path -Path $_ -ChildPath 'readme.enable-multi-api.md' }
}

Function ValidateUserProvidedReadme {
  Param(
    $basePath
  )

  In "$restSpecsRepoPath/specification" {
    $readme = Join-Path -Path ($basePath | Resolve-Path) -ChildPath 'readme.enable-multi-api.md'

    if (-not (Test-Path $readme)) {
      throw "Unable to find readme '$readme' in specs repo"
    }

    return $readme
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