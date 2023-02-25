import { CategorizedClassDoc } from './dgeni-definitions';

/**
 * Determines the component or directive metadata from the specified Dgeni class doc. The resolved
 * directive metadata will be stored in a Map.
 *
 * ```ts
 * @Component({
 *   inputs: ["red", "blue"],
 *   exportAs: "test"
 * })
 * export class MyComponent {}
 * ```
 */
export function getDirectiveMetadata(
  classDoc: CategorizedClassDoc
): Map<string, string> | null {
  const decorators = classDoc.decorators || [];

  const angularDecorators = decorators
    .filter((decorator) => decorator.isCallExpression)
    .filter(
      (decorator) =>
        decorator.name === 'Component' ||
        decorator.name === 'Directive' ||
        decorator.name === 'Pipe'
    );

  // a Component/Directive/Pipe should be decorated with only one decorator
  if (angularDecorators.length !== 1) {
    return null;
  }

  const processDecorator = angularDecorators[0];

  const resultMetadata = new Map<string, string>();
  (processDecorator.argumentInfo || []).forEach((argumentInfo) =>
    Object.entries(argumentInfo)
      .filter(([, argumentInfo]) => typeof argumentInfo === 'string')
      .forEach(([key, argumentInfo]: [string, string]) =>
        resultMetadata.set(key, argumentInfo)
      )
  );

  return resultMetadata;
}
