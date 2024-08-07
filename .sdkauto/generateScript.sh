#!/bin/bash
set -eou pipefail

LOCAL_PATH=$(cat $1 | jq -r '.specFolder')
README_FILES=$(cat $1 | jq -r '[.relatedReadmeMdFiles[]] | join(",")')
OUTPUT_PATH=$2

pushd generator

echo "npm run generate-all -- --specs-dir $LOCAL_PATH --readme-files $README_FILES --output-path $OUTPUT_PATH"
npm run generate-all -- --specs-dir $LOCAL_PATH --readme-files $README_FILES --output-path $OUTPUT_PATH

popd
