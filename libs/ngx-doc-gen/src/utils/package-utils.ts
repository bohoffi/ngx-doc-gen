import { Package } from 'dgeni';
import { NgEntrypoint } from '../interfaces/ng-entrypoint';
import { NgPackage } from '../interfaces/ng-package';
const jsdocPackage = require('dgeni-packages/jsdoc');
const nunjucksPackage = require('dgeni-packages/nunjucks');
const typescriptPackage = require('dgeni-packages/typescript');

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
