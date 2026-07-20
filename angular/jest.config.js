module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEach: [],
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/'],
  moduleFileExtensions: ['ts', 'html', 'js', 'json'],
};
