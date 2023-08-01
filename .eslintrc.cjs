module.exports = {
  env: { browser: true, es2020: true },
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'standard-with-typescript',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  rules: {
    '@typescript-eslint/restrict-template-expressions': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    // type declarations are more flexible
    '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
    'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
    'space-before-function-paren': 'off',
    'multiline-ternary': 'off',
    indent: 'off',
  },
}
