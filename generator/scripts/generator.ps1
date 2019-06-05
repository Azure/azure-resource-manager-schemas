$ErrorActionPreference  = "stop"
. $PSScriptRoot/shared.ps1
. $PSScriptRoot/constants.ps1

## ===========================================================================
# script
  
in $schemas {
  => "Running git checkout in $schemas"
  git checkout -- .;
  if (-not $?) {
    /! "Failed to run git checkout in $schemas"
  }

  => "Running git clean in $schemas"
  git clean -xfd .;
  if (-not $?) {
    /! "Failed to run git clean in $schemas"
  }
}

$allModulePaths = @()

foreach ($moduleBasePath in $apiVersionWhitelist.Keys) {
  $fullModulePath = "$restSpecs/specification/$moduleBasePath"
  if (-not (Test-Path $fullModulePath)) {
    /! "Failed to locate module in $fullModulePath"
  }

  $foundModulePaths = Get-ChildItem -Recurse -Directory -Path "$fullModulePath" | Where-Object { $_.Name -match "^\d{4}-\d{2}-\d{2}(|-preview)$" }

  if (-not ($apiVersionWhitelist[$moduleBasePath] -contains '*')) {
    $foundModulePaths = $foundModulePaths | Where-Object { $apiVersionWhitelist[$moduleBasePath] -contains $_.Name }
    $foundApiVersions = $foundModulePaths | ForEach-Object { $_.Name }

    foreach ($apiVersion in $apiVersionWhitelist[$moduleBasePath]) {
      if (-not ($foundApiVersions -contains $apiVersion)) {
        /! "Failed to locate api version $apiVersion in module $fullModulePath"
      }
    }
  }

  $allModulePaths += $foundModulePaths
}

foreach ($modulePath in $allModulePaths) {
  $jsonSpecs = Get-ChildItem -File -Recurse -Include '*.json' -Path $modulePath `
    | Where-Object { (Get-Content -Path $_ | ConvertFrom-Json).swagger -eq "2.0" }

  if ($jsonSpecs.Count -eq 0) {
    /! "Unable to find any swagger specs in $modulePath"
    continue
  }

  $verboseParam = if ($autoRestVerboseOutput) { "--verbose" } else { "" }
  $apiVersion = $modulePath.Name
  $inputFileParams = ($jsonSpecs | ForEach-Object { "--input-file=$_" }) -join " "

  $autoRestParams = @(
    "--use=$autoRestGenerator",
    "--output-folder=$schemas",
    "--api-version=$apiVersion",
    "--azureresourceschema",
    "--title=none"
  )

  if ($autoRestVerboseOutput) {
    $autoRestParams += "--verbose"
  }

  foreach ($jsonSpec in $jsonSpecs) {
    $autoRestParams += "--input-file=$jsonSpec"
  }

  => "Running autorest $($autoRestParams -join ' ')"
  autorest $autoRestParams;

  if (-not $?) {
    /! "Autorest failed for module $modulePath"
  }
}