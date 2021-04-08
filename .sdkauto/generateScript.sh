#!/bin/bash

set -ex

PARAMS=$(cat $1 | jq '{localPath: .specFolder, readmeFiles: .relatedReadmeMdFiles}' -c)

pushd generator

npm run generate-all $PARAMS