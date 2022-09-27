import { Package } from 'dgeni';
import * as jsdocPackage from 'dgeni-packages/jsdoc';
import * as nunjucksPackage from 'dgeni-packages/nunjucks';
import * as typescriptPackage from 'dgeni-packages/typescript';
import { NgEntrypoint } from '../interfaces/ng-entrypoint';
import { NgPackage } from '../interfaces/ng-package';

export const createDgeniPackage = (packageName: string): Package => {
  return new Package(packageName, [
    jsdocPackage,
    nunjucksPackage,
    typescriptPackage
  ]);
};

export const collectEntrypoints = (ngPackage: NgPackage): NgEntrypoint[] => {
  return [
    ngPackage.primary,
    ...ngPackage.secondaries
  ];
};
