import { addProjectConfiguration, getProjects, ProjectConfiguration, ProjectType, Tree } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { ConfigureGeneratorOptions } from './configure-generator.options';
import configure from './generator';
import { createNonExistingProjectsErrorMessage } from './utils';

interface TestProject {
  projectName: string;
  projectConfiguration: ProjectConfiguration;
}

const createApplication = (projectName: string): TestProject => ({
  projectName,
  projectConfiguration: createProjectConfig(projectName, 'application', true)
});

const createLibrary = (projectName: string, buildable?: boolean): TestProject => ({
  projectName,
  projectConfiguration: createProjectConfig(projectName, 'library', buildable)
});

const createProjectConfig = (projectName: string, projectType: ProjectType, buildable?: boolean): ProjectConfiguration => {
  const configuration: ProjectConfiguration = {
    root: `${projectType === 'application' ? 'apps' : 'libs'}/${projectName}`,
    projectType
  };

  if (buildable) {
    configuration.targets = {
      build: {
        executor: projectType === 'application'
          ? '@angular-devkit/build-angular:browser'
          : '@nrwl/angular:package'
      }
    };
  }

  return configuration;
};

const getAffectedProjects = (workspace: Map<string, ProjectConfiguration>): [string, ProjectConfiguration][] => Array.from(workspace.entries())
  .filter(([, projectConfiguration]) => !!projectConfiguration.targets?.['doc-gen']);

const checkResult = (expected: {
  affected: string[]
}, actual: [string, ProjectConfiguration][]): void => {
  // check length
  expect(actual).toHaveLength(expected.affected.length);
  // check expected project was configured
  expect(expected.affected.every(p => actual.map(([projectName]) => projectName).includes(p))).toBeTruthy();
};

describe('configure generator', () => {
  let configureOptions: ConfigureGeneratorOptions;
  let workspace: Map<string, ProjectConfiguration>;
  let configuredWorkspace: Map<string, ProjectConfiguration>;
  let workspaceTree: Tree;

  const createWorkspace = (workspace: Map<string, ProjectConfiguration>) =>
    Array.from(workspace.entries()).forEach(([key, projectConfig]) =>
      addProjectConfiguration(workspaceTree, key, projectConfig)
    );

  beforeEach(() => {
    configureOptions = {};
    workspace = new Map();
    configuredWorkspace = new Map();
    workspaceTree = createTreeWithEmptyWorkspace();
  });

  describe('using default options (`{}`)', () => {

    it('should configure no projects as there are no libraries', async () => {

      // setup workspace
      const workspaceProjects: TestProject[] = [
        createApplication('demo'),
        createApplication('administration'),
        createApplication('client-side')
      ];

      workspaceProjects.forEach(tp => workspace.set(tp.projectName, tp.projectConfiguration));

      createWorkspace(workspace);

      // run generator
      await configure(workspaceTree, configureOptions);
      configuredWorkspace = getProjects(workspaceTree);

      const affectedProjects = getAffectedProjects(configuredWorkspace);

      checkResult({
        affected: []
      },
        affectedProjects
      );
    });

    it('should configure no projects as there are no "buildable" libraries', async () => {

      // setup workspace
      const workspaceProjects: TestProject[] = [
        createLibrary('lib-a'),
        createLibrary('lib-b'),
        createLibrary('lib-c')
      ];

      workspaceProjects.forEach(tp => workspace.set(tp.projectName, tp.projectConfiguration));

      createWorkspace(workspace);

      // run generator
      await configure(workspaceTree, configureOptions);
      configuredWorkspace = getProjects(workspaceTree);

      const affectedProjects = getAffectedProjects(configuredWorkspace);

      checkResult({
        affected: []
      },
        affectedProjects
      );
    });

    it('should configure "buildable" projects when libraries', async () => {

      // setup workspace
      const workspaceProjects: TestProject[] = [
        createApplication('demo'),
        createApplication('administration'),
        createLibrary('lib-a', true),
        createLibrary('lib-b')
      ];

      workspaceProjects.forEach(tp => workspace.set(tp.projectName, tp.projectConfiguration));

      createWorkspace(workspace);

      // run generator
      await configure(workspaceTree, configureOptions);
      configuredWorkspace = getProjects(workspaceTree);

      const affectedProjects = getAffectedProjects(configuredWorkspace);

      checkResult({
        affected: [
          'lib-a'
        ]
      },
        affectedProjects
      );
    });
  });

  describe('using passed options', () => {

    it('should configure no projects as passed projects are no libraries', async () => {
      configureOptions = {
        projects: [
          'administration',
          'client-side'
        ]
      };

      // setup workspace
      const workspaceProjects: TestProject[] = [
        createApplication('demo'),
        createApplication('administration'),
        createApplication('client-side')
      ];

      workspaceProjects.forEach(tp => workspace.set(tp.projectName, tp.projectConfiguration));

      createWorkspace(workspace);

      // run generator
      await configure(workspaceTree, configureOptions);
      configuredWorkspace = getProjects(workspaceTree);

      const affectedProjects = getAffectedProjects(configuredWorkspace);

      checkResult({
        affected: []
      },
        affectedProjects
      );
    });

    it('should configure no projects as passed projects are no "buildable" libraries', async () => {
      configureOptions = {
        projects: [
          'lib-a',
          'lib-b',
          'lib-c'
        ]
      };

      // setup workspace
      const workspaceProjects: TestProject[] = [
        createLibrary('lib-a'),
        createLibrary('lib-b'),
        createLibrary('lib-c')
      ];

      workspaceProjects.forEach(tp => workspace.set(tp.projectName, tp.projectConfiguration));

      createWorkspace(workspace);

      // run generator
      await configure(workspaceTree, configureOptions);
      configuredWorkspace = getProjects(workspaceTree);

      const affectedProjects = getAffectedProjects(configuredWorkspace);

      checkResult({
        affected: []
      },
        affectedProjects
      );
    });

    it('should configure only "buildable" libraries', async () => {
      configureOptions = {
        projects: [
          'lib-a',
          'lib-b',
          'lib-c'
        ]
      };

      // setup workspace
      const workspaceProjects: TestProject[] = [
        createLibrary('lib-a'),
        createLibrary('lib-b', true),
        createLibrary('lib-c')
      ];

      workspaceProjects.forEach(tp => workspace.set(tp.projectName, tp.projectConfiguration));

      createWorkspace(workspace);

      // run generator
      await configure(workspaceTree, configureOptions);
      configuredWorkspace = getProjects(workspaceTree);

      const affectedProjects = getAffectedProjects(configuredWorkspace);

      checkResult({
        affected: [
          'lib-b'
        ]
      },
        affectedProjects
      );
    });
  });

  describe('error handling', () => {

    it('should throw an error if a non existing project is passed in options', async () => {
      const nonExistingProjects = [
        'lib-b',
        'lib-c'
      ];
      configureOptions = {
        projects: [
          'lib-a',
          ...nonExistingProjects
        ]
      };

      // setup workspace
      const workspaceProjects: TestProject[] = [
        createApplication('administration'),
        createApplication('client-side'),
        createLibrary('lib-a')
      ];

      workspaceProjects.forEach(tp => workspace.set(tp.projectName, tp.projectConfiguration));

      createWorkspace(workspace);

      expect(configure(workspaceTree, configureOptions)).rejects.toEqual(
        new Error(createNonExistingProjectsErrorMessage(nonExistingProjects))
      );
    });
  });
});
