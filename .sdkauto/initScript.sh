#!/bin/bash

set -ex

dpkg -s jq &> /dev/null

if [ ! $0 -eq 0]; then
  sudo apt-get update && sudo apt-get install jq -y
fi

pushd generator

npm install

popd