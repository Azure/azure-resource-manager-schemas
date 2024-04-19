// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function replaceRefByName(schema: any, definitionName: string, replacement: any) {
  doRecursively(schema, val => {
    if (val['$ref'] === `#/definitions/${definitionName}`) {
      return replacement;
    }

    return val;
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function replaceCyclicRefByName(schema: any, definitionName: string, replacement: any) {
  const refVertices: Record<string, Set<string>> = {};

  for (const refName in schema.definitions) {
    refVertices[refName] = new Set<string>();

    doRecursively(schema.definitions[refName], val => {
      if (val['$ref'] && val['$ref'].startsWith('#/definitions/')) {
        refVertices[refName].add(val['$ref'].substring('#/definitions/'.length));
      }

      return val;
    });
  }

  const parentDefinitions = findCyclicReferencingDefinitions(refVertices, definitionName);
  for (const parentDefinition of parentDefinitions) {
    replaceRefByName(schema.definitions[parentDefinition], definitionName, replacement);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function doRecursively(schema: any, func: (input: any) => any) {
  if (typeof schema === 'object') {
    for (const key of Object.keys(schema)) {
      schema[key] = doRecursively(schema[key], func);
    }
  }
  else if (Array.isArray(schema)) {
    for (let i = 0; i < schema.length; i++) {
      schema[i] = doRecursively(schema[i], func);
    }
  }

  return func(schema);
}

function findCyclicReferencingDefinitions(refVertices: Record<string, Set<string>>, definitionName: string) {
  const visited = new Set<string>();
  const queue = [definitionName];

  const parentDefinitions = new Set<string>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) {
      continue;
    }
    visited.add(current);

    if (!refVertices[current]) {
      continue;
    }

    for (const dependency of refVertices[current]) {
      if (dependency === definitionName) {
        parentDefinitions.add(current);
      }

      queue.push(dependency);
    }
  }

  return parentDefinitions;
}