import { stdout } from 'process';
import type { Arguments } from 'yargs';
import yargs from 'yargs';
import * as engine from '../generate/dgeni-engine';
import { NgxDocGenConfig } from '../schema/ngx-doc-gen-config';
import chalk from 'chalk';
import { EOL } from 'os';

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
      excludeBase: {
        type: 'array',
        default: []
      }
    });

export const handler = async (argv: Arguments<NgxDocGenConfig>): Promise<void> => {
  const config: NgxDocGenConfig = {
    basePath: argv.basePath,
    packageName: argv.packageName,
    logLevel: argv.logLevel,
    outputPath: argv.outputPath,
    excludeBase: argv.excludeBase || [] as string[]
  };
  const workingDirectory = process.cwd();

  engine.generate(config, workingDirectory)
    .catch((e: any) => {
      process.stdout.write(chalk.red(e));
      process.exit(1);
    })
    .then(packageName => {
      process.stdout.write(chalk.green(`Successfully generated documentation for ${packageName}${EOL}${EOL}`));

      process.exit(0);
    });
};
