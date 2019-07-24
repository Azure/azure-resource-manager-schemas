## functions

function ResolvePath {
  param (
      [string] $FileName
  )

  $FileName = Resolve-Path $FileName -ErrorAction SilentlyContinue `
                                     -ErrorVariable _frperror
  if (-not($FileName)) {
      $FileName = $_frperror[0].TargetObject
  }

  return $FileName
}

function In($location, $scriptblock) {
  pushd $location
  try {
    & $scriptblock
  } finally {
    popd 
  }
}

function Log-Action { Param ( [parameter(ValueFromRemainingArguments=$true)] $content, [switch] $NoNewline) Write-Host -ForegroundColor green -NoNewline:$NoNewline $content }
function Log-Info { Param ( [parameter(ValueFromRemainingArguments=$true)] $content, [switch] $NoNewline) Write-Host -ForegroundColor darkgray -NoNewline:$NoNewline $content }
function Log-Warn { Param ( [parameter(ValueFromRemainingArguments=$true)] $content, [switch] $NoNewline) Write-Host -ForegroundColor yellow -NoNewline:$NoNewline $content }
function Log-Error { Param ( [parameter(ValueFromRemainingArguments=$true)] $content, [switch] $NoNewline) Write-Host -ForegroundColor red -NoNewline:$NoNewline $content }