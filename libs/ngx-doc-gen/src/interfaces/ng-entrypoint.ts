import { NgPackageJson } from './ng-package-json';
import { PackageJson } from './package-json';

export interface NgEntrypoint {
  basePath: string;
  entrypointName: string;
  packageJson: PackageJson;
  ngPackageJson: NgPackageJson;
}
