#!/bin/bash

set -e

PARAMS=$(cat $1 | jq '{localPath: .specFolder, readmeFiles: .relatedReadmeMdFiles, $outputPath}' -c --arg outputPath $2)

echo $PARAMS

pushd generator

npm run generate-all $PARAMS