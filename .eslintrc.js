module.exports = {
  env: {
    browser: true,
    es2020: true,
  },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 11,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: ['@/features/*/*'],
      },
    ],
    // '@typescript-eslint/no-empty-function': ['error', { allow: ['methods', 'arrowFunctions'] }],
    '@typescript-eslint/no-empty-function': ['off'],
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        varsIgnorePattern: '^_',
        argsIgnorePattern: '^_',
      },
    ],
    // '@typescript-eslint/no-explicit-any': ['error'],
    '@typescript-eslint/no-explicit-any': ['off'],
    'no-console': ['error'],
    'no-debugger': ['error'],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
  },
};
