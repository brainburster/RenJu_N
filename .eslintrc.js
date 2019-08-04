module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: [
    'airbnb-base',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    "linebreak-style": [0, "error", "windows"],
    "no-unused-expressions": 0,
    "no-param-reassign": 0,
    "no-bitwise": 0,
    "no-continue": 0,
    "no-restricted-globals": 0,
    "no-restricted-syntax": 0,
    "no-alert": 0
  }
};