import { readFileSync } from 'fs-extra';

export const readFile = (filePath: string, encoding?: BufferEncoding): Buffer | string | null => {
  try {
    const content: Buffer = fsReadFile(filePath);

    return encoding ? content.toString(encoding) : content;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const fsReadFile = (filePath: string): Buffer => {
  return readFileSync(filePath);
};
