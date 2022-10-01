import { Package } from 'dgeni';
import * as jsdocPackage from 'dgeni-packages/jsdoc';
import * as nunjucksPackage from 'dgeni-packages/nunjucks';
import * as typescriptPackage from 'dgeni-packages/typescript';
import { NgEntryPoint } from 'ng-packagr/lib/ng-package/entry-point/entry-point';
import { NgPackage } from 'ng-packagr/lib/ng-package/package';

export const createDgeniPackage = (packageName: string): Package => {
  return new Package(packageName, [
    jsdocPackage,
    nunjucksPackage,
    typescriptPackage
  ]);
};

export const collectEntrypoints = (ngPackage: NgPackage): NgEntryPoint[] => {
  return [
    ngPackage.primary,
    ...ngPackage.secondaries
  ];
};
