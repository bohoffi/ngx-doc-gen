import { addDependenciesToPackageJson, convertNxGenerator, GeneratorCallback, Tree } from '@nrwl/devkit';
import { runTasksInSerial } from '@nrwl/workspace/src/utilities/run-tasks-in-serial';

async function init(
  tree: Tree
): Promise<GeneratorCallback> {

  const installPackageTask = addDependenciesToPackageJson(
    tree,
    {},
    {
      'ngx-doc-gen': 'latest'
    }
  );

  return runTasksInSerial(installPackageTask);
};

export default init;

export const initSchematic = convertNxGenerator(init);
