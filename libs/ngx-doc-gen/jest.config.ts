/* eslint-disable */
module.exports = {
  displayName: 'ngx-doc-gen',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/ngx-doc-gen',
  coverageReporters: [['lcov', { projectRoot: 'libs/ngx-doc-gen' }]],
};
