// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const replaceCyclicRef = (cyclicRef: any) => {
  if (cyclicRef && cyclicRef['$ref']) {
    delete cyclicRef['$ref'];
    cyclicRef['type'] = 'object';
  }
}