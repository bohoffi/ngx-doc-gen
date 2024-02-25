import { logger as originalLogger } from '@nx/devkit';

const logger: Record<keyof typeof originalLogger, jest.Mock> = {
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  log: jest.fn(),
  debug: jest.fn(),
  fatal: jest.fn(),
};

module.exports = {
  ...jest.requireActual('@nx/devkit'),
  logger,
};
