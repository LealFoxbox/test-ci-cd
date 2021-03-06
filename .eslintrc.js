module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react-native', 'react-hooks', 'react-native-a11y', 'jest', 'prettier', 'import'],
  extends: [
    '@react-native-community',
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:jest/recommended',
    'plugin:react-native-a11y/recommended',
    'plugin:testing-library/react',
    'plugin:prettier/recommended',
    'prettier',
    'prettier/@typescript-eslint',
    'prettier/react',
  ],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
      modules: true,
    },
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname,
  },
  env: {
    es6: true,
    jest: true,
    'react-native/react-native': true,
  },

  rules: {
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/camelcase': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-use-before-define': 'error',
    '@typescript-eslint/no-non-null-assertion': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/require-await': 'error',
    '@typescript-eslint/restrict-plus-operands': 'error',
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-floating-promises': ['error', { ignoreIIFE: true }],
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    'prettier/prettier': 'error',
    'react/prop-types': 'off',
    'react/jsx-boolean-value': 'error',
    'react-native/no-unused-styles': 'error',
    'react-native/no-color-literals': 'error',
    'react-native/no-inline-styles': 'off',
    'sort-imports': ['error', { ignoreDeclarationSort: true }],
    'import/newline-after-import': ['error', { count: 1 }],
    'no-console': 'warn',
    'import/no-named-as-default': 'off',
    'import/named': 'off',
    'import/default': 'off',
    'import/namespace': 'off',
    'import/no-default-export': 'off',
    'import/no-unresolved': 'off',
    'import/export': 'off',
    'no-void': 'off',
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
      },
    ],
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      node: {
        moduleDirectory: ['./', 'node_modules'],
      },
      typescript: {
        directory: './tsconfig.json',
      },
    },
  },
};
