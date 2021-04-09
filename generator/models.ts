export enum ScopeType {
  None = 0,
  Unknown = 1 << 0,
  Tenant = 1 << 1,
  Subcription = 1 << 2,
  ResourceGroup = 1 << 3,
  ManagementGroup = 1 << 4,
  Extension = 1 << 5,
}

export interface AutogenConfig {
  basePath: string,
  namespace: string,
  readmeFile?: string,
  overrideApiVersion?: ApiVersionFile,
  suffix?: string,
  resourceConfig?: AutogenResourceConfig[],
  postProcessor?: SchemaPostProcessor,
}

export interface ApiVersionFile {
  [apiVersion: string]: string[]
}

export interface CodeBlock {
  readonly "input-file"?: ReadonlyArray<string>|string
}

export interface AutogenResourceConfig {
  type: string,
  scopes?: ScopeType,
}

export interface SchemaPostProcessor {
  (namespace: string, apiVersion: string, schema: any): void,
}

export interface Package {
  packageName?: string,
  path: string[],
  result: 'succeeded' | 'failed' | 'warning'
}