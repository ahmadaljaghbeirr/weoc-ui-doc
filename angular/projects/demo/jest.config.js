// Overrides the project-scoped testMatch that @angular-builders/jest generates internally.
// That default builds the pattern by concatenating a native (backslash-separated on Windows)
// absolute project path with a forward-slash glob suffix, which never matches Jest's
// internally forward-slash-normalized candidate paths on Windows. Using Jest's own
// `<rootDir>` token keeps this path-separator-safe.
module.exports = {
  roots: ['<rootDir>/projects/demo'],
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[tj]s?(x)'],
};
