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
}
