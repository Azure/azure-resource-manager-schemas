// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export enum ScopeType {
  None = 0,
  Unknown = 1 << 0,
  Tenant = 1 << 1,
  Subscription = 1 << 2,
  ResourceGroup = 1 << 3,
  ManagementGroup = 1 << 4,
  Extension = 1 << 5,
}