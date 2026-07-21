// Overrides the project-scoped testMatch that @angular-builders/jest generates internally.
// That default builds the pattern by concatenating a native (backslash-separated on Windows)
// absolute project path with a forward-slash glob suffix, which never matches Jest's
// internally forward-slash-normalized candidate paths on Windows. Using Jest's own
// `<rootDir>` token keeps this path-separator-safe.
module.exports = {
  roots: ['<rootDir>/projects/demo'],
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[tj]s?(x)'],
  // "weoc-ui-ng" is resolved via the TypeScript `paths` mapping in tsconfig.json
  // (-> ./dist/weoc-ui-ng), which the Angular build system understands but Jest's
  // module resolver does not. Map it straight to the library's TS source instead of
  // the built dist output so demo tests exercise current source and never require a
  // fresh `ng build weoc-ui-ng` before `ng test demo` can run.
  moduleNameMapper: {
    '^weoc-ui-ng$': '<rootDir>/projects/weoc-ui-ng/src/public-api.ts',
  },
  transformIgnorePatterns: ['node_modules/(?!(.*\\.mjs$|@angular/common/locales/.*\\.js$|@noble/.*\\.js$))'],
};
