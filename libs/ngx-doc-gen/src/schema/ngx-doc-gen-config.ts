import { LogLevel } from '../types/log-level';

export interface NgxDocGenConfig {
  basePath: string;
  logLevel?: LogLevel;
  outputPath?: string;
  packageName?: string;
  /**
   * A list of base classes to exclude from generating (e.g. 'Observable')
   */
  excludeBase?: string[];
}
