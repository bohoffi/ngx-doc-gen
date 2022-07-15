import { NgEntrypoint } from './ng-entrypoint';

export interface NgPackage {
  basePath: string;
  version?: string;
  packageName: string;
  primary: NgEntrypoint;
  secondaries: NgEntrypoint[];
}
