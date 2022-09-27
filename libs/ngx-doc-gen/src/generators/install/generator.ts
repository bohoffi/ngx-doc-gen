import { formatFiles, GeneratorCallback, getProjects, logger, Tree, updateProjectConfiguration } from '@nrwl/devkit';
import { InstallGeneratorOptions } from './install-generator.options';

export default async function install(
  tree: Tree,
  installOptions: InstallGeneratorOptions
): Promise<void | GeneratorCallback> {

  const workspaceProjects = getProjects(tree);

  const workspaceLibraries = Array.from(workspaceProjects.entries()).filter(([, projectConfiguration]) => {
    return projectConfiguration.projectType === 'library' && typeof projectConfiguration.targets?.build === 'object';
  });

  const optionsProjects = (installOptions.projects || []);

  // check if a project name was given which does not exist in workspace libraries
  const nonExistingProjects = optionsProjects.filter(optionsProject => !workspaceLibraries.map(([projectName]) => projectName).includes(optionsProject));
  if ((nonExistingProjects).some(p => p)) {
    throw new Error(
      `❌ You specified projects which do not exist in workspace: "${nonExistingProjects.join(', ')}".`
    );
  }

  const specifiedLibraries = workspaceLibraries.filter(([projectName]) => optionsProjects.includes(projectName));

  specifiedLibraries.forEach(([projectName, projectConfiguration]) => {
    if (projectConfiguration.targets) {

      projectConfiguration.targets['doc-gen'] = {
        executor: 'ngx-doc-gen:generate'
      };

      updateProjectConfiguration(tree, projectName, projectConfiguration);

      logger.info(`✔️ Successfully configured "${projectName}" for documentation generation.`);
    }
  });

  await formatFiles(tree);
};
