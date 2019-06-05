
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

function write-hostcolor { Param ( $color,  [parameter(ValueFromRemainingArguments=$true)] $content ) write-host -fore $color $content }
function comment { Param ( [parameter(ValueFromRemainingArguments=$true)] $content ) write-host -fore darkgray $content }
function action { Param ( [parameter(ValueFromRemainingArguments=$true)] $content ) write-host -fore green $content }
function warn { Param ( [parameter(ValueFromRemainingArguments=$true)] $content ) write-host -fore yellow $content }

function err { Param ( [parameter(ValueFromRemainingArguments=$true)] $content ) write-host -fore red $content }

new-alias '//'  comment
new-alias '/#'  comment
new-alias '=>' action
new-alias '/$' warn
new-alias '/!' err

new-alias '==>' write-hostcolor