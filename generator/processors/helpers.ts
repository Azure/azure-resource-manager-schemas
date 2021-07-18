export const replaceCyclicRef = (cyclicRef: any) => {
  if (cyclicRef && cyclicRef['$ref']) {
    delete cyclicRef['$ref'];
    cyclicRef['type'] = 'object';
  }
}