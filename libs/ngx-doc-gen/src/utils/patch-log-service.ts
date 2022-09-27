/** Regular expression that matches TypeScript mixin names inside of the project. */
const mixinNameRegex = /_\w+Base/;

/**
 * Function that patches Dgeni's instantiated log service. The patch will hide warnings about
 * unresolved TypeScript symbols for the mixin base classes.
 *
 * Those warnings are valid, but are not fixable because the base class is created dynamically
 * through mixin functions and will be stored as a constant.
 */
export function patchLogService(log: any) {
  const _warnFn = log.warn;

  log.warn = function (message: string) {
    if (message.includes('Unresolved TypeScript symbol') && mixinNameRegex.test(message)) {
      return;
    }

    _warnFn.apply(log, [message]);
  };
}
