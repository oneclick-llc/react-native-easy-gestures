module.exports = {
  root: true,
  extends: '@react-native-community',
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import', 'unused-imports'],
  rules: {
    eqeqeq: 'error',
    'no-var': 'error',
    'object-curly-spacing': ['error', 'always'],
    curly: ['error', 'multi-or-nest', 'consistent'],
    semi: 0,
    'no-extra-semi': 0,
    'no-unused-vars': 'off',
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
      },
    ],
    'jsx-quotes': ['error', 'prefer-single'],
    'react-hooks/rules-of-hooks': 'error',
    'react-native/no-inline-styles': 'off',
    'react-hooks/exhaustive-deps': 'warn',
    'eslint-comments/no-unused-disable': 0,
    'import/order': [
      'warn',
      {
        'newlines-between': 'always',
        groups: [
          'internal',
          'external',
          'builtin',
          'index',
          'sibling',
          'parent',
          'object',
        ],
      },
    ],
    'no-undef': 'off',
    'no-shadow': 0,

    // Typescript
    '@typescript-eslint/no-shadow': ['error'],
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'class',
        format: ['PascalCase'],
      },
    ],
    '@typescript-eslint/ban-types': [
      'warn',
      {
        types: {
          Array: 'Use [] instead',
          Object: {
            message: 'Use object instead',
            fixWith: 'object',
          },
          String: {
            message: 'Use string instead',
            fixWith: 'string',
          },
          Number: {
            message: 'Use number instead',
            fixWith: 'number',
          },
          Boolean: {
            message: 'Use boolean instead',
            fixWith: 'boolean',
          },
        },
      },
    ],
    '@typescript-eslint/explicit-member-accessibility': 'off',
  },
  globals: {
    React: true,
    google: true,
    mount: true,
    mountWithRouter: true,
    shallow: true,
    shallowWithRouter: true,
    context: true,
    expect: true,
    jsdom: true,
    JSX: true,
  },
  overrides: [],
}
