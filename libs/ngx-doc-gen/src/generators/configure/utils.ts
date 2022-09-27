export const createNonExistingProjectsErrorMessage = (nonExistingProjects: string[]): string => {
  return `❌ You specified projects which do not exist in workspace: "${nonExistingProjects.join(', ')}".`
};
