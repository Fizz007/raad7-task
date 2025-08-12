export interface IBaseModel {
  id: string;
  createdAt: string; // ISO string
  lastUpdatedAt: string; // ISO string
  deleted?: boolean;
}

export enum TagCategoryStatus {
  Active = "active",
  Inactive = "inactive",
}

export enum PrecisionType {
  Exact = "exact",
  Fuzzy = "fuzzy",
  Regex = "regex",
}

export enum TagGroup {
  System = "system",
  User = "user",
  Content = "content",
}

export type MatchRule = {
  kind: "match";
  pattern: string; // string or regex source
};

export type ReplaceRule = {
  kind: "replace";
  from: string;
  to: string;
};

export type Rule = MatchRule | ReplaceRule; // discriminated union

export interface MetadataConfig {
  caseSensitive: boolean;
  matchThreshold?: number; // used for fuzzy
  rules?: Rule[];
}

export interface TagCategoryLite {
  id: string;
  name: string;
}

export interface ITagCategory extends IBaseModel {
  name: string;
  description?: string;
  status: TagCategoryStatus;
  precisionType: PrecisionType;
  group: TagGroup;
  metadataConfig: MetadataConfig;
  subCategories: TagCategoryLite[];
}

export type TagCategoryFormValues = Omit<ITagCategory, keyof IBaseModel>;