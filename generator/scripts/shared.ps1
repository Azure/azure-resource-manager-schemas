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

function Log-Action { Param ( [parameter(ValueFromRemainingArguments=$true)] $content ) write-host -fore green $content }
function Log-Info { Param ( [parameter(ValueFromRemainingArguments=$true)] $content ) write-host -fore darkgray $content }
function Log-Warn { Param ( [parameter(ValueFromRemainingArguments=$true)] $content ) write-host -fore yellow $content }
function Log-Error { Param ( [parameter(ValueFromRemainingArguments=$true)] $content ) write-host -fore red $content }