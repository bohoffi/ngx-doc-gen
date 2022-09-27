import { statSync } from 'fs-extra';
import * as path from 'canonical-path';
import * as FastGlob from 'fast-glob';

import { NgEntrypoint } from '../interfaces/ng-entrypoint';
import { NgPackageJson } from '../interfaces/ng-package-json';
import { PackageJson } from '../interfaces/package-json';
import { parseJson } from './json-utils';
import { NgPackage } from '../interfaces/ng-package';

export const discoverNgPackage = async (workingDirectory: string, basePath: string): Promise<NgPackage> => {
  let projectPath = path.join(workingDirectory, basePath);
  projectPath = path.isAbsolute(projectPath) ? projectPath : path.resolve(projectPath);

  const primary = resolveEntrypoint(projectPath);
  if (!primary?.packageJson || !primary?.ngPackageJson) {
    throw new Error();
  }

  const secondaryPaths = await findSecondaryEntryPointsPaths(projectPath);
  const secondaries: NgEntrypoint[] = [];

  for (const folderPath of secondaryPaths) {
    const secondaryPackage = resolveEntrypoint(folderPath, true);
    if (secondaryPackage) {
      secondaries.push(secondaryEntryPoint(primary, secondaryPackage));
    }
  }

  return {
    basePath: projectPath,
    packageName: primary.entrypointName,
    version: primary.packageJson.version,
    primary,
    secondaries
  };
};

/**
 * Resolves a given path to an entrypoint.
 * @param entryPointPath
 * @param isSecondary
 * @returns
 */
const resolveEntrypoint = (entryPointPath: string, isSecondary = false): NgEntrypoint | undefined => {
  const fullPath = path.resolve(entryPointPath);
  const pathStats = statSync(fullPath);
  const basePath = pathStats.isDirectory() ? fullPath : path.dirname(fullPath);
  const packageJson = parseJson<PackageJson>(path.join(basePath, 'package.json'));

  if (!packageJson && !isSecondary) {
    throw new Error(`Cannot discover package sources at ${basePath} as 'package.json' was not found.`);
  }

  if (packageJson && typeof packageJson !== 'object') {
    throw new Error(`Invalid 'package.json' at ${basePath}.`);
  }

  let ngPackageJson: NgPackageJson | null;
  if (packageJson && packageJson?.ngPackage) {
    // Read `ngPackage` from `package.json`
    ngPackageJson = packageJson.ngPackage;
  } else if (pathStats.isDirectory()) {
    ngPackageJson = parseJson<NgPackageJson>(path.join(basePath, 'ng-package.json'));
    if (!ngPackageJson) {
      ngPackageJson = parseJson(path.join(basePath, 'ng-package.js'));
    }
  } else {
    ngPackageJson = parseJson(basePath);
  }

  if (ngPackageJson) {
    ngPackageJson = ngPackageJson['default'] ?? ngPackageJson;

    return {
      basePath,
      entrypointName: packageJson.name,
      packageJson,
      ngPackageJson
    };
  }

  if (pathStats.isDirectory()) {
    // return even if it's undefined and use defaults when it's not a file
    return undefined;
  }

  if (pathStats.isFile()) {
    // a project file was specified but was in valid
    if (path.basename(entryPointPath) === 'package.json') {
      throw new Error(`Cannot read a package from 'package.json' without 'ngPackage' property.`);
    }

    throw new Error(`Trying to read a package from unsupported file extension. Path: ${entryPointPath}`);
  }

  throw new Error(`Cannot discover package sources at ${entryPointPath}`);
};

const findSecondaryEntryPointsPaths = async (directoryPath: string): Promise<string[]> => {
  const ignorePattern = [
    '**/node_modules/**',
    '**/.git/**',
    `${directoryPath}/package.json`,
    `${directoryPath}/ng-package.json`,
  ];

  return await FastGlob.default(`${directoryPath}/**/{package,ng-package}.json`, {
    ignore: ignorePattern,
    onlyFiles: true,
    cwd: directoryPath
  });
};

const secondaryEntryPoint = (primary: NgEntrypoint, userPackage: any): NgEntrypoint => {
  const { packageJson, ngPackageJson, basePath } = userPackage;
  if (path.resolve(basePath) === path.resolve(primary.basePath)) {
    console.error(`Cannot read secondary entry point. It's already a primary entry point. Path: ${basePath}`);
    throw new Error(`Secondary entry point is already a primary.`);
  }

  const relativeSourcePath = path.relative(primary.basePath, basePath);
  const secondaryModuleId = path.join(`${primary.entrypointName}/${relativeSourcePath}`);

  return {
    basePath,
    entrypointName: secondaryModuleId,
    packageJson,
    ngPackageJson
  };
};

