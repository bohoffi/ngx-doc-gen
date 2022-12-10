import { formatFiles, GeneratorCallback, getProjects, logger, Tree, updateProjectConfiguration } from '@nrwl/devkit';
import { ConfigureGeneratorOptions } from './configure-generator.options';
import { createNonExistingProjectsErrorMessage } from './utils';

export default async function configure(
  tree: Tree,
  installOptions: ConfigureGeneratorOptions
): Promise<void | GeneratorCallback> {
  const optionsProjects = (installOptions.projects || []);

  logger.info('Fetching workspace projects...');
  const workspaceProjects = Array.from(getProjects(tree).entries());

  // check if a project name was given which does not exist in workspace libraries
  const nonExistingProjects = optionsProjects.filter(optionsProject => !workspaceProjects.map(([projectName]) => projectName).includes(optionsProject));
  if ((nonExistingProjects).some(p => p)) {
    throw new Error(createNonExistingProjectsErrorMessage(nonExistingProjects));
  }

  logger.info('Choosing libraries...');
  const workspaceLibraries = workspaceProjects.filter(([, projectConfiguration]) => projectConfiguration.projectType === 'library');

  if (optionsProjects.length) {
    logger.info(`Filter for specified libraries: "${optionsProjects.join(', ')}"`);
  }
  const specifiedLibraries = optionsProjects.length ? workspaceLibraries.filter(([projectName]) => optionsProjects.includes(projectName)) : workspaceLibraries;

  specifiedLibraries
    // filter on buildable libraries
    .filter(([, projectConfiguration]) => typeof projectConfiguration.targets?.build === 'object')
    // processing
    .forEach(([projectName, projectConfiguration]) => {
      if (projectConfiguration.targets) {

        projectConfiguration.targets['doc-gen'] = {
          executor: 'ngx-doc-gen:generate'
        };

        updateProjectConfiguration(tree, projectName, projectConfiguration);

        logger.info(`✅ Successfully configured "${projectName}" for documentation generation.`);
      }
    });

  await formatFiles(tree);
}
