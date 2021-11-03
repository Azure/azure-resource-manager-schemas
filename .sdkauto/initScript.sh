#!/bin/bash

set -e

npm install -g npm

pushd generator

npm ci

popd