// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { executeSynchronous, } from '../utils';
import yargs from 'yargs';

const argsConfig = yargs
  .strict()
  .option('input-path', { type: 'string', desc: 'The path to find batch results' })
  .option('batch-count', { type: 'number', desc: 'The total number of batches' });

executeSynchronous(async () => {
  const args = await argsConfig.parseAsync();

  const inputPath = args['input-path'];
  const batchCount = args['batch-count'];

  console.log(`inputPath: ${inputPath}`);
  console.log(`batchCount: ${batchCount}`);
});