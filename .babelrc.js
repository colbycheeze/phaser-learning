module.exports = {
  presets: [
    ['@babel/preset-env', { modules: false }],
    '@babel/preset-react',
  ],
  plugins: [
    // Stage 1
    '@babel/plugin-proposal-export-default-from',
    '@babel/plugin-proposal-logical-assignment-operators',
    ['@babel/plugin-proposal-optional-chaining', { loose: false }],
    '@babel/plugin-proposal-do-expressions',

    // Stage 2
    '@babel/plugin-proposal-export-namespace-from',

    // Stage 3
    ['@babel/plugin-proposal-class-properties', { loose: false }],
  ],
};
