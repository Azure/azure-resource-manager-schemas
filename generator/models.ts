export enum ScopeType {
  None = 0,
  Unknown = 1 << 0,
  Tenant = 1 << 1,
  Subcription = 1 << 2,
  ResourceGroup = 1 << 3,
  ManagementGroup = 1 << 4,
  Extension = 1 << 5,
}

export interface WhitelistConfig {
  basePath: string,
  namespace: string,
  suffix?: string,
  resourceConfig?: WhitelistResourceConfig[],
  postProcessor?: SchemaPostProcessor,
}

export interface WhitelistResourceConfig {
  type: string,
  scopes?: ScopeType,
}

export interface SchemaPostProcessor {
  (namespace: string, apiVersion: string, schema: any): void,
}