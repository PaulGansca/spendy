module.exports = {
  env: {
    node: true, // For Node.js globals, such as `setTimeout`
    es2021: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
};
