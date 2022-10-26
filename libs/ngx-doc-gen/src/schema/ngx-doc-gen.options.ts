import { TagDefinition } from '../common/tags';
import { LogLevel } from '../types/log-level';

export interface NgxDocGenOptions {
  /**
   * Configures the logger output. Defaults to `warn`.
   */
  logLevel?: LogLevel;
  /**
   * Configures the output directory for the generated documentation. Default to `docs`.
   */
  outputPath?: string;
  /**
   * A list of base classes to exclude from generating (e.g. 'Observable')
   */
  excludeBase?: string[];
  /**
     * Run through and reports activity without writing out results.
     */
  dryRun?: boolean;
  /**
   * Configures tag definition for the Dgeni JSDoc processor not supported by JSDoc.
   */
  customTags?: TagDefinition[],
  /**
   * Tag to enforce documentation of usually private symbols. Only applies to symbols at least exported. Defaults to `docs-public`.
   */
  docsPublic?: string;
  /**
   * Tag to explicitly hide symbols from documentation. Defaults to `docs-private`.
   */
  docsPrivate?: string;
  /**
   * Tag indicating the version with which a deprecated symbol will get removed. Defaults to `breaking-change`.
   */
  breakingChange?: string;
}
