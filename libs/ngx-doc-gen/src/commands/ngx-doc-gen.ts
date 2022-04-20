import type { Arguments } from 'yargs';
import yargs from 'yargs';
import { NgxDocGenConfig } from '../schema/ngx-doc-gen-config';

export const command: string[] = ['generate', '$0'];
export const desc: string = 'Automagically generate your Angular documentation';

export const builder = (yargs: yargs.Argv<NgxDocGenConfig>): yargs.Argv =>
  yargs
    .positional('basePath', {
      alias: 'b',
      demandOption: true,
      normalize: true,
      type: 'string'
    })
    .options({
      packageName: {
        type: 'string'
      },
      logLevel: {
        type: 'string',
        choices: ['error', 'warn', 'debug', 'verbose'] as const,
        default: 'warn'
      },
      outputPath: {
        type: 'string',
        default: './docs',
        normalize: true
      },
      templatePath: {
        type: 'string',
        normalize: true
      }
    });

export const handler = (argv: Arguments<NgxDocGenConfig>): void => {
  const config: NgxDocGenConfig = {
    basePath: argv.basePath,
    packageName: argv.packageName,
    logLevel: argv.logLevel,
    outputPath: argv.outputPath,
    templatePath: argv.templatePath,
  };

  process.stdout.write(`basePath: ${config.basePath}\n`);
  process.stdout.write(`packageName: ${config.packageName}\n`);
  process.stdout.write(`logLevel: ${config.logLevel}\n`);
  process.stdout.write(`outputPath: ${config.outputPath}\n`);
  process.stdout.write(`templatePath: ${config.templatePath}\n`);
  process.exit(0);
};
