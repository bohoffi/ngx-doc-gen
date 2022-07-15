export interface NgPackageJson {
  default?: NgPackageJson;
  lib?: {
    entryFile: string;
  }
}
