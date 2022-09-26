import { ExecutorContext, logger } from '@nrwl/devkit';

import { NgxDocGenOptions } from '../../schema/ngx-doc-gen.options';
import * as engine from '../../generate/dgeni-engine';

export default async function generateDoc(
  options: NgxDocGenOptions,
  context: ExecutorContext
): Promise<{
  success: boolean;
}> {

  const project = context.workspace.projects[context.projectName];

  if (!project) {
    logger.error('❌ Cannot generate a documentation without a project.');
    return {
      success: false
    };
  }

  if (project.projectType !== 'library') {
    logger.error('❌ Documentation generation only supports library projects.');
    return {
      success: false
    };
  }

  const workspaceRoot = context.root;
  const projectRoot = project.root;

  try {
    const generate = await engine.generate(options, workspaceRoot, projectRoot);
    logger.info(`✔️ Successfully generated documentation for ${generate}`);

    return {
      success: true
    };

  } catch (e) {
    logger.error('❌ An error occurred while generating the documentation:');
    logger.error(e);
    return {
      success: false
    };
  }
};
