#!/bin/bash

set -ex

if [ ! -f $PWD/generateInput.json ]; then
  echo "$PWD/generateInput.json not found!"
  exit 1
fi

PARAMS=$(cat $PWD/generateInput.json | jq '{localPath: .specFolder, readmeFiles: .relatedReadmeMdFiles}' -c)

pushd generator

npm run generate-all $PARAMS