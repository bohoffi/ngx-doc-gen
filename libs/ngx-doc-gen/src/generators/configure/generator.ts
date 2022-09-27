import { formatFiles, GeneratorCallback, getProjects, logger, Tree, updateProjectConfiguration } from '@nrwl/devkit';
import { ConfigureGeneratorOptions } from './configure-generator.options';

export default async function configure(
  tree: Tree,
  installOptions: ConfigureGeneratorOptions
): Promise<void | GeneratorCallback> {

  logger.info('Fetching workspace projects...');

  const workspaceProjects = getProjects(tree);

  logger.info('Choosing buildable libraries...');

  const workspaceLibraries = Array.from(workspaceProjects.entries()).filter(([, projectConfiguration]) => {
    return projectConfiguration.projectType === 'library' && typeof projectConfiguration.targets?.build === 'object';
  });

  const optionsProjects = (installOptions.projects || []);

  // check if a project name was given which does not exist in workspace libraries
  const nonExistingProjects = optionsProjects.filter(optionsProject => !workspaceLibraries.map(([projectName]) => projectName).includes(optionsProject));
  if ((nonExistingProjects).some(p => p)) {
    throw new Error(`❌ You specified projects which do not exist in workspace: "${nonExistingProjects.join(', ')}".`);
  }

  if (optionsProjects.length) {
    logger.info(`Filter for specified libraries: "${optionsProjects.join(', ')}"`);
  }

  const specifiedLibraries = optionsProjects.length ? workspaceLibraries.filter(([projectName]) => optionsProjects.includes(projectName)) : workspaceLibraries;

  specifiedLibraries.forEach(([projectName, projectConfiguration]) => {
    if (projectConfiguration.targets) {

      projectConfiguration.targets['doc-gen'] = {
        executor: 'ngx-doc-gen:generate'
      };

      updateProjectConfiguration(tree, projectName, projectConfiguration);

      logger.info(`✅ Successfully configured "${projectName}" for documentation generation.`);
    }
  });

  await formatFiles(tree);
};
