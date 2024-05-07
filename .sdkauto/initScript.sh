#!/bin/bash
set -e

git submodule update --init --recursive

npm --prefix bicep-types-az/bicep-types/src/bicep-types ci
npm --prefix bicep-types-az/bicep-types/src/bicep-types run build

npm --prefix bicep-types-az/src/autorest.bicep ci
npm --prefix bicep-types-az/src/autorest.bicep run build

npm --prefix generator ci
