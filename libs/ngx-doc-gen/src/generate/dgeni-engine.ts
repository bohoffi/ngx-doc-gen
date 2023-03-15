import { Dgeni, Package } from 'dgeni';
import { ReadTypeScriptModules } from 'dgeni-packages/typescript/processors/readTypeScriptModules';
import { TsParser } from 'dgeni-packages/typescript/services/TsParser';
import { discoverPackages } from 'ng-packagr/lib/ng-package/discover-packages';
import * as path from 'canonical-path';

import { HighlightNunjucksExtension } from '../extensions/nunjucks';
import { AsyncFunctionsProcessor } from '../processors/async-functions';
import { Categorizer, categorizer } from '../processors/categorizer';
import { DocsPrivateFilter } from '../processors/docs-private-filter';
import { EntryPointGrouper } from '../processors/entry-point-grouper';
import { ErrorUnknownJsdocTagsProcessor } from '../processors/error-unknown-jsdoc-tags';
import { FilterDuplicateExports } from '../processors/filter-duplicate-exports';
import {
  MergeInheritedProperties,
  mergeInheritedProperties,
} from '../processors/merge-inherited-properties';
import {
  ResolveInheritedDocs,
  resolveInheritedDocs,
} from '../processors/resolve-inherited-docs';
import { NgxDocGenOptions } from '../schema/ngx-doc-gen.options';
import { LogLevel } from '../types/log-level';
import { collectEntrypoints, createDgeniPackage } from '../utils/package-utils';
import { patchLogService } from '../utils/patch-log-service';
import { NgPackage } from 'ng-packagr/lib/ng-package/package';

export const generate = async (
  options: NgxDocGenOptions,
  workingDirectory: string,
  projectRoot: string
): Promise<string> => {
  let projectPath = path.join(workingDirectory, projectRoot);
  projectPath = path.isAbsolute(projectPath)
    ? projectPath
    : path.resolve(projectPath);

  const ngPackage = await discoverPackages({
    project: projectPath,
  });

  return await generateDocumentation(ngPackage, workingDirectory, options);
};

const generateDocumentation = async (
  ngPackge: NgPackage,
  workingDirectory: string,
  options: NgxDocGenOptions
): Promise<string> => {
  const outputDir = path.join(workingDirectory, options.outputPath);
  const dgeniPackage = createDgeniPackage(ngPackge.primary.moduleId);

  setProcessors(dgeniPackage, options);

  configureCategorizer(dgeniPackage, options);
  configureExcludeBase(dgeniPackage, options.excludeBase);

  configureLogging(dgeniPackage, options.logLevel);
  disbableNativeReadFilesProcessor(dgeniPackage);
  configureComputPathsProcessor(dgeniPackage);
  configureCostumJsDocTags(dgeniPackage, options);
  configureIgnoreDefaultExports(dgeniPackage);
  configureTemplateEngine(dgeniPackage);
  configureTypeScriptModule(
    dgeniPackage,
    ngPackge,
    outputDir,
    workingDirectory
  );

  return await new Dgeni([dgeniPackage])
    .generate()
    .then(() => ngPackge.primary.moduleId);
};

/**
 * Sets the different processors used to transform to code.
 */
const setProcessors = (
  dgeniPackage: Package,
  options: NgxDocGenOptions
): void => {
  // Processor that resolves inherited docs of class docs. The resolved docs will
  // be added to the pipeline so that the JSDoc processors can capture these too.
  // Note: needs to use a factory function since the processor relies on DI.
  dgeniPackage.processor(resolveInheritedDocs);

  // Processor that filters out duplicate exports that should not be shown in the docs.
  dgeniPackage.processor(new FilterDuplicateExports());

  // Processor that merges inherited properties of a class with the class doc.
  // Note: needs to use a factory function since the processor relies on DI.
  dgeniPackage.processor(mergeInheritedProperties);

  // Processor that filters out symbols that should not be shown in the docs.
  dgeniPackage.processor(
    new DocsPrivateFilter(options.docsPublic, options.docsPrivate)
  );

  // Processor that throws an error if API docs with unknown JSDoc tags are discovered.
  dgeniPackage.processor(new ErrorUnknownJsdocTagsProcessor());

  // Processor that appends categorization flags to the docs, e.g. `isDirective`, `isNgModule`, etc.
  dgeniPackage.processor(categorizer);

  // Processor to group docs into top-level entry-points such as "tabs", "sidenav", etc.
  dgeniPackage.processor(new EntryPointGrouper());

  // Processor that marks asynchronous methods. Additionally, automatically adds a return
  // description for async methods which do not return any value.
  dgeniPackage.processor(new AsyncFunctionsProcessor());
};

/**
 * Sets public, private and breakingChange tags at Categorizer.
 */
const configureCategorizer = (
  dgeniPackage: Package,
  options: NgxDocGenOptions
): void => {
  dgeniPackage.config(function (categorizer: Categorizer) {
    categorizer.docsPublic = options.docsPublic;
    categorizer.docsPrivate = options.docsPrivate;
    categorizer.breakingChange = options.breakingChange;
  });
};

/**
 * Sets excluded bases at ResolveInheritedDocs.
 */
const configureExcludeBase = (
  dgeniPackage: Package,
  excludeBase?: string[]
): void => {
  dgeniPackage.config(function (
    resolveInheritedDocs: ResolveInheritedDocs,
    mergeInheritedProperties: MergeInheritedProperties
  ) {
    resolveInheritedDocs.excludeBase = excludeBase || [];
    mergeInheritedProperties.excludeBase = excludeBase || [];
  });
};

const configureLogging = (dgeniPackage: Package, logLevel: LogLevel): void => {
  dgeniPackage.config(function (log: any) {
    return (log.level = logLevel);
  });
  dgeniPackage.config(function (log: any) {
    return patchLogService(log);
  });
};

const disbableNativeReadFilesProcessor = (dgeniPackage: Package): void => {
  // Configure the processor for reading files from the file system.
  dgeniPackage.config(function (readFilesProcessor: any) {
    // Disabled since we only use the "readTypeScriptModules" processor
    readFilesProcessor.$enabled = false;
  });
};

const configureComputPathsProcessor = (dgeniPackage: Package): void => {
  // Configure the output path for written files (i.e., file names).
  dgeniPackage.config(function (computePathsProcessor: any) {
    computePathsProcessor.pathTemplates = [
      {
        docTypes: ['entry-point'],
        pathTemplate: '${name}',
        outputPathTemplate: '${name}.html',
      },
    ];
  });
};

const configureCostumJsDocTags = (
  dgeniPackage: Package,
  options: NgxDocGenOptions
): void => {
  dgeniPackage.config(function (parseTagsProcessor: any) {
    parseTagsProcessor.tagDefinitions =
      parseTagsProcessor.tagDefinitions.concat([
        { name: options.docsPublic },
        { name: options.docsPrivate },
        ...options.customTags,
      ]);
  });
};

const configureIgnoreDefaultExports = (dgeniPackage: Package): void => {
  // Configure the processor for understanding TypeScript.
  dgeniPackage.config(function (readTypeScriptModules: ReadTypeScriptModules) {
    readTypeScriptModules.hidePrivateMembers = true;
    // ignore 'default' exports
    readTypeScriptModules.ignoreExportsMatching.push('default');
  });
};

const configureTemplateEngine = (dgeniPackage: Package): void => {
  // Configure processor for finding nunjucks templates.
  dgeniPackage.config(function (templateFinder: any, templateEngine: any) {
    // Standard patterns for matching docs to templates
    templateFinder.templatePatterns = [
      '${ doc.template }',
      '${ doc.id }.${ doc.docType }.template.html',
      '${ doc.id }.template.html',
      '${ doc.docType }.template.html',
      '${ doc.id }.${ doc.docType }.template.js',
      '${ doc.id }.template.js',
      '${ doc.docType }.template.js',
      '${ doc.id }.${ doc.docType }.template.json',
      '${ doc.id }.template.json',
      '${ doc.docType }.template.json',
      'common.template.html',
    ];

    // Dgeni disables autoescape by default, but we want this turned on.
    templateEngine.config.autoescape = true;

    // Nunjucks and Angular conflict in their template bindings so change Nunjucks
    templateEngine.config.tags = {
      variableStart: '{$',
      variableEnd: '$}',
    };

    templateEngine.tags.push(new HighlightNunjucksExtension());
  });
};

const configureTypeScriptModule = (
  dgeniPackage: Package,
  ngPackage: NgPackage,
  outputDirectory: string,
  workingDirectory: string
): void => {
  // Configure the Dgeni docs package to respect our passed options from the Bazel rule.
  dgeniPackage.config(function (
    readTypeScriptModules: ReadTypeScriptModules,
    tsParser: TsParser,
    entryPointGrouper: EntryPointGrouper,
    templateFinder: any,
    writeFilesProcessor: any,
    readFilesProcessor: any
  ) {
    const packagePath = ngPackage.src;
    // Set the base path for the "readFilesProcessor" to the execroot. This is necessary because
    // otherwise the "writeFilesProcessor" is not able to write to the specified output path.
    readFilesProcessor.basePath = workingDirectory;

    // Set the base path for parsing the TypeScript source files to the directory that includes
    // all sources (also known as the path to the current Bazel target). This makes it easier for
    // custom processors (such as the `entry-point-grouper) to compute entry-point paths.
    readTypeScriptModules.basePath = packagePath;

    // Initialize the "tsParser" path mappings. These will be passed to the TypeScript program
    // and therefore use the same syntax as the "paths" option in a tsconfig.
    tsParser.options.paths = {};

    const packageEntrypoints = collectEntrypoints(ngPackage);
    packageEntrypoints.forEach((ep) => {
      const entrypointIndexPath = `${ep.entryFilePath}`;

      entryPointGrouper.entryPoints.push(ep);
      tsParser.options.paths[`${ep.moduleId}`] = [entrypointIndexPath];
      readTypeScriptModules.sourceFiles.push(entrypointIndexPath);
    });

    // Base URL for the `tsParser`. The base URL refer to the directory that includes all
    // package sources that need to be processed by Dgeni.
    tsParser.options.baseUrl = packagePath;

    // This is ensures that the Dgeni TypeScript processor is able to parse node modules such
    // as the Angular packages which might be needed for doc items. e.g. if a class implements
    // the "AfterViewInit" interface from "@angular/core". This needs to be relative to the
    // "baseUrl" that has been specified for the "tsParser" compiler options.
    tsParser.options.paths['*'] = [
      path.join(workingDirectory, 'node_modules/*'),
    ];

    // Since our base directory is the Bazel execroot, we need to make sure that Dgeni can
    // find all templates needed to output the API docs.
    // templateFinder.templateFolders = [path.join(__dirname, 'templates')];
    templateFinder.templateFolders = [
      path.join(path.resolve(__dirname, '..'), 'templates'),
    ];

    // The output path for files will be computed by joining the output folder with the base path
    // from the "readFilesProcessors". Since the base path is the execroot, we can just use
    // the output path passed from Bazel (e.g. $EXECROOT/bazel-out/bin/src/docs-content)
    writeFilesProcessor.outputFolder = outputDirectory;
  });
};
