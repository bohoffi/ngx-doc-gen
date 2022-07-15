import { parse, printParseErrorCode } from 'jsonc-parser';
import type { ParseError } from 'jsonc-parser';
import { readFile } from './file-utils';

export const parseJson = <T extends object = any>(
  filePath: string,
  disallowComments = false,
  expectComments = true
): T | null => {

  const fileContent = readFile(filePath, 'utf-8');

  if (!fileContent) {
    return null;
  }

  try {

    if (disallowComments || !expectComments) {
      return JSON.parse(fileContent as string);
    }

  } catch (error) {
    if (disallowComments) {
      throw error;
    }
  }

  const errors: ParseError[] = [];
  const result: T = parse(fileContent as string, errors);

  if (errors.length > 0) {
    const { error, offset } = errors[0];
    throw new Error(
      `${printParseErrorCode(error)} in JSON at position ${offset}`
    );
  }

  return result;
}
