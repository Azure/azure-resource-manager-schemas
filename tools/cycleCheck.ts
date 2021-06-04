class SchemaRefNode {
  children: {[key: string]: SchemaRefNode} = {};
}

function findByRef(schema: any, ref: string) {
  const pathArray = ref.substr(2).split('/');
  for (const path of pathArray) {
    schema = schema[path];
  }

  return schema;
}

function findRefs(schema: any, root: SchemaRefNode) {
  if (Array.isArray(schema)) {
    for (const entry of schema) {
      findRefs(entry, root);
    }
  } else if (typeof schema === 'object') {
    for (const key of Object.keys(schema)) {
      findRefs(schema[key], root);
    }

    const foundRef = schema['$ref'];
    if (foundRef && foundRef.indexOf('#/') === 0) {
      root.children[foundRef] = new SchemaRefNode();
    }
  }
}

function buildRefGraph(schema: object) {
  const root = new SchemaRefNode();
  findRefs(schema, root);
  for (const schemaRef of Object.keys(root.children)) {
    const childNode = root.children[schemaRef];
    const childSchema = findByRef(schema, schemaRef);
    findRefs(childSchema, childNode);
  }

  return root;
}

export function findCycle(schema: object) {
  const root = buildRefGraph(schema);
  for (const schemaRef of Object.keys(root.children)) {
    const cycle = findDependencyCycle(schemaRef, root);
    if (cycle) {
      return [schemaRef, ...cycle];
    }
  }
}

function findDependencyCycle(identifier: string, root: SchemaRefNode) {
  return findDependencyCycleRecursive(identifier, identifier, root, new Set<string>());
}

function findDependencyCycleRecursive(originalIdentifier: string, identifier: string, root: SchemaRefNode, visited: Set<string>): string[] | undefined {
  const dependencies = root.children[identifier].children;
  for (const dependency of Object.keys(dependencies)) {
    if (visited.has(dependency)) {
      continue;
    }

    if (dependency === originalIdentifier) {
      return [originalIdentifier];
    }

    visited.add(dependency);
    const result = findDependencyCycleRecursive(originalIdentifier, dependency, root, visited);
    if (result) {
      return [dependency, ...result];
    }
  }
}
