import type { Arguments } from 'yargs';
import yargs from 'yargs';
import * as engine from '../generate/dgeni-engine';
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
      }
    });

export const handler = async (argv: Arguments<NgxDocGenConfig>): Promise<void> => {
  const config: NgxDocGenConfig = {
    basePath: argv.basePath,
    packageName: argv.packageName,
    logLevel: argv.logLevel,
    outputPath: argv.outputPath
  };
  const workingDirectory = process.cwd();
  const currentDirectory = __dirname;

  await engine.generate(config, workingDirectory);

  process.exit(0);

  // engine.generate(config, workingDirectory)
  //   .catch((e: any) => {
  //     process.stdout.write(e);
  //     process.exit(1);
  //   })
  //   .then(() => {
  //     process.stdout.write('DONE\n');
  //     process.exit(0);
  //   });
};
