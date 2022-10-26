import { DocCollection, Document, Processor } from 'dgeni';
import { ApiDoc } from 'dgeni-packages/typescript/api-doc-types/ApiDoc';
import { ConstExportDoc } from 'dgeni-packages/typescript/api-doc-types/ConstExportDoc';
import { FunctionExportDoc } from 'dgeni-packages/typescript/api-doc-types/FunctionExportDoc';
import { InterfaceExportDoc } from 'dgeni-packages/typescript/api-doc-types/InterfaceExportDoc';
import { TypeAliasExportDoc } from 'dgeni-packages/typescript/api-doc-types/TypeAliasExportDoc';
import { NgEntryPoint } from 'ng-packagr/lib/ng-package/entry-point/entry-point';
import * as path from 'canonical-path';

import { isDeprecatedDoc, isPrimaryExportDoc } from '../common/decorators';
import { CategorizedClassDoc } from '../common/dgeni-definitions';

export interface ModuleInfo {
  /** Name of the module (e.g. toolbar, drag-drop, ripple, slider-testing) */
  name: string;
  /** Name of the package that contains this entry point. */
  packageName: string;
  /** Name of the entry-point that contains this module. */
  entryPointName: string;
}

/** Document type for an entry-point. */
export class EntryPointDoc {
  /** Unique document type for Dgeni. */
  docType = 'entry-point';

  /** Name of the component group. */
  name: string;

  /** Display name of the entry-point. */
  displayName: string;

  /** Module import path for the entry-point. */
  moduleImportPath: string;

  /** Name of the package, either material or cdk */
  packageName: string;

  /** Display name of the package. */
  // packageDisplayName: string;

  /** Unique id for the entry-point. */
  id: string;

  /** Known aliases for the entry-point. This is only needed for the `computeIdsProcessor`. */
  aliases: string[] = [];

  /** List of categorized class docs that are defining a directive. */
  directives: CategorizedClassDoc[] = [];

  /** List of categorized class docs that are defining a service. */
  services: CategorizedClassDoc[] = [];

  /** Classes that belong to the entry-point. */
  classes: CategorizedClassDoc[] = [];

  /** Interfaces that belong to the entry-point. */
  interfaces: InterfaceExportDoc[] = [];

  /** Type aliases that belong to the entry-point. */
  typeAliases: TypeAliasExportDoc[] = [];

  /** Functions that belong to the entry-point. */
  functions: FunctionExportDoc[] = [];

  /** Constants that belong to the entry-point. */
  constants: ConstExportDoc[] = [];

  /** List of NgModules which are exported in the current entry-point. */
  exportedNgModules: CategorizedClassDoc[] = [];

  /** List of test harnesses which are exported in the entry-point. */
  testHarnesses: CategorizedClassDoc[] = [];

  /**
   * Name of the primary export of the entry-point. This export will be showed
   * in the API docs as export when show-casing the import to the entry-point.
   */
  primaryExportName: string | null = null;

  constructor(name: string) {
    this.name = name;
    this.id = `entry-point-${name}`;
  }
}

/**
 * Processor to group docs into entry-points that consist of directives, component, classes,
 * interfaces, functions or type aliases.
 */
export class EntryPointGrouper implements Processor {
  name = 'entryPointGrouper';
  $runBefore = ['docs-processed'];
  $runAfter = ['docs-private-filter'];
  entryPoints: NgEntryPoint[] = [];

  $process(docs: DocCollection) {
    const entryPointsDocs = new Map<string, EntryPointDoc>();

    docs.forEach(doc => {
      const docEntryPoint = this._getDocumentEntryPoint(doc);

      const entryPointName = docEntryPoint.flatModuleFile;

      // Get the entry-point for this doc, or, if one does not exist, create it.
      let entryPointDoc: EntryPointDoc;
      if (entryPointsDocs.has(entryPointName)) {
        entryPointDoc = entryPointsDocs.get(entryPointName);
      } else {
        entryPointDoc = new EntryPointDoc(entryPointName);
        entryPointsDocs.set(entryPointName, entryPointDoc);
      }

      entryPointDoc.displayName = docEntryPoint.moduleId;
      entryPointDoc.moduleImportPath = docEntryPoint.moduleId;

      // Put this doc into the appropriate list in the entry-point doc.
      if (doc.isDirective) {
        entryPointDoc.directives.push(doc);
      } else if (doc.isService) {
        entryPointDoc.services.push(doc);
      } else if (doc.isNgModule) {
        entryPointDoc.exportedNgModules.push(doc);
      } else if (doc.docType === 'class') {
        entryPointDoc.classes.push(doc);
        if (doc.isTestHarness) {
          entryPointDoc.testHarnesses.push(doc);
        }
      } else if (doc.docType === 'interface') {
        entryPointDoc.interfaces.push(doc);
      } else if (doc.docType === 'type-alias') {
        entryPointDoc.typeAliases.push(doc);
      } else if (doc.docType === 'function') {
        entryPointDoc.functions.push(doc);
      } else if (doc.docType === 'const') {
        entryPointDoc.constants.push(doc);
      }

      if (isPrimaryExportDoc(doc)) {
        entryPointDoc.primaryExportName = doc.name;
      }
    });

    // For each entry-point where no explicit primary export has been specified
    // through the "@docs-primary-export" tag, we determine a primary export by
    // looking for possible "NgModule" classes or test harnesses.
    entryPointsDocs.forEach(entryPoint => {
      if (entryPoint.primaryExportName !== null) {
        return;
      }

      const ngModuleExport = this._findBestPrimaryExport(entryPoint.exportedNgModules);
      if (ngModuleExport !== null) {
        entryPoint.primaryExportName = ngModuleExport.name;
        return;
      }
      const testHarnessExport = this._findBestPrimaryExport(entryPoint.testHarnesses);
      if (testHarnessExport !== null) {
        entryPoint.primaryExportName = testHarnessExport.name;
      }
    });

    return Array.from(entryPointsDocs.values());
  }

  /**
   * Walks through the specified API documents and looks for the best
   * API document that could serve as primary export of an entry-point.
   */
  private _findBestPrimaryExport(docs: ApiDoc[]): ApiDoc | null {
    // Usually the first doc that is not deprecated is used, but in case there are
    // only deprecated doc, the last deprecated doc is used. We don't want to always
    // skip deprecated docs as they could be still needed for documentation of a
    // deprecated entry-point.
    for (const doc of docs) {
      if (!isDeprecatedDoc(doc)) {
        return doc;
      }
    }
    return null;
  }

  /**
   * Resolves entrypoint of the given Dgeni document.
   */
  private _getDocumentEntryPoint(doc: Document): NgEntryPoint | never {
    const basePath: string = doc.fileInfo.basePath;
    const filePath: string = doc.fileInfo.filePath;
    const relativeFilePath = path.relative(basePath, filePath).replace(/\\/g, '/');
    const foundEntryPoint = this._findMatchingEntryPoint(relativeFilePath);

    if (!foundEntryPoint) {
      throw Error(`Could not determine entry-point for: ${doc.name} in ${basePath}`);
    }

    return foundEntryPoint;
  }

  /** Finds the matching entry-point of the given file path. */
  private _findMatchingEntryPoint(relativeFilePath: string): NgEntryPoint | null {
    return this.entryPoints.find(ep => relativeFilePath.startsWith(path.basename(ep.basePath)))
      || this.entryPoints.find(ep => ep.isSecondaryEntryPoint === false) || null;
  }
}
