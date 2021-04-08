#!/bin/bash

set -ex

PARAMS=$(cat $1 | jq '{localPath: .specFolder, readmeFiles: .relatedReadmeMdFiles, $outputPath}' -c --arg outputPath $2)

pushd generator

npm run generate-all $PARAMS