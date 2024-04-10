// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import path from 'path';
import os from 'os';
import { findRecursive, executeCmd, fileExists } from './utils';
import * as constants from './constants';
import { readFile, writeFile } from 'fs/promises';
import * as markdown from '@ts-common/commonmark-to-markdown'
import * as yaml from 'js-yaml'

const autorestBinary = os.platform() === 'win32' ? 'autorest.cmd' : 'autorest';

const rootDir = `${__dirname}/../`;
const extensionDir = path.resolve(`${rootDir}/bicep-types-az/src/autorest.bicep/`);

export async function generateAutorestV2Config(readmePath: string, bicepReadmePath: string) {
  // We expect a path format convention of <provider>/(any/number/of/intervening/folders)/<yyyy>-<mm>-<dd>(|-preview)/<filename>.json
  // This information is used to generate individual tags in the generated autorest configuration
  // eslint-disable-next-line no-useless-escape
  const pathRegex = /^(\$\(this-folder\)\/|)([^\/]+)(?:\/[^\/]+)*\/(\d{4}-\d{2}-\d{2}(|-preview))\/.*\.json$/i;

  const readmeContents = await readFile(readmePath, { encoding: 'utf8' });
  const readmeMarkdown = markdown.parse(readmeContents);

  const inputFiles = new Set<string>();
  // we need to look for all autorest configuration elements containing input files, and collect that list of files. These will look like (e.g.):
  // ```yaml $(tag) == 'someTag'
  // input-file:
  // - path/to/file.json
  // - path/to/other_file.json
  // ```
  for (const node of markdown.iterate(readmeMarkdown.markDown)) {
    // We're only interested in yaml code blocks
    if (node.type !== 'code_block' || !node.info || !node.literal ||
      !node.info.trim().startsWith('yaml')) {
      continue;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const yamlData = yaml.load(node.literal) as any;
    if (yamlData) {
      // input-file may be a single string or an array of strings
      const inputFile = yamlData['input-file'];
      if (typeof inputFile === 'string') {
        inputFiles.add(inputFile);
      } else if (inputFile instanceof Array) {
        for (const i of inputFile) {
          inputFiles.add(i);
        }
      }
    }
  }

  const filesByTag: Record<string, string[]> = {};
  for (const file of inputFiles) {
    const normalizedFile = normalizeJsonPath(file);
    const match = pathRegex.exec(normalizedFile);
    if (match) {
      // Generate a unique tag. We can't process all of the different API versions in one autorest pass
      // because there are constraints on naming uniqueness (e.g. naming of definitions), so we want to pass over
      // each API version separately.
      const tagName = `${match[2].toLowerCase()}-${match[3].toLowerCase()}`;
      if (!filesByTag[tagName]) {
        filesByTag[tagName] = [];
      }

      filesByTag[tagName].push(normalizedFile);
    } else {
      console.warn(`WARNING: Unable to parse swagger path "${file}"`);
    }
  }

  let generatedContent = `##Bicep

### Bicep multi-api
\`\`\`yaml $(bicep) && $(multiapi)
${yaml.dump({ 'batch': Object.keys(filesByTag).map(tag => ({ 'tag': tag })) }, { lineWidth: 1000 })}
\`\`\`
`;

  for (const tag of Object.keys(filesByTag)) {
    generatedContent += `### Tag: ${tag} and bicep
\`\`\`yaml $(tag) == '${tag}' && $(bicep)
${yaml.dump({ 'input-file': filesByTag[tag] }, { lineWidth: 1000})}
\`\`\`
`;
  }

  await writeFile(bicepReadmePath, generatedContent);
}

function normalizeJsonPath(jsonPath: string) {
  // eslint-disable-next-line no-useless-escape
  return path.normalize(jsonPath).replace(/[\\\/]/g, '/');
}

async function execAutoRest(tmpFolder: string, params: string[]) {
    await executeCmd(__dirname, `${__dirname}/node_modules/.bin/${autorestBinary}`, params);
    if (!fileExists(tmpFolder)) {
        return [];
    }

    return await findRecursive(tmpFolder, p => path.extname(p) === '.json');
}

export async function runAutorestV2(readme: string, tmpFolder: string) {
    const autoRestParams = [
        `--use=@autorest/modelerfour`,
        `--use=${extensionDir}`,
        '--bicep',
        `--output-folder=${tmpFolder}`,
        '--multiapi',
        '--title=none',
        // This is necessary to avoid failures such as "ERROR: Semantic violation: Discriminator must be a required property." blocking type generation.
        // In an ideal world, we'd raise issues in https://github.com/Azure/azure-rest-api-specs and force RP teams to fix them, but this isn't very practical
        // as new validations are added continuously, and there's often quite a lag before teams will fix them - we don't want to be blocked by this in generating types.
        `--skip-semantics-validation`,
        `--arm-schema=true`,
        readme,
    ];

    if (constants.autoRestVerboseOutput) {
        autoRestParams.push('--verbose');
    }

    return await execAutoRest(tmpFolder, autoRestParams);
}