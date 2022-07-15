import { NgPackageJson } from './ng-package-json';

export interface PackageJson {
  name: string;
  version?: string;
  ngPackage?: NgPackageJson;
}
