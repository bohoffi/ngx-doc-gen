import { LogLevel } from '../types/log-level';

export interface NgxDocGenConfig {
  basePath: string;
  logLevel?: LogLevel;
  outputPath?: string;
  packageName?: string;
  templatePath?: string;
}
