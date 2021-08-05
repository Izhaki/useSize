module.exports = function getBabelConfig(api) {
  const useESModules = api.env(['esm', 'modern']);

  const presets = [
    [
      '@babel/preset-env',
      {
        bugfixes: true,
        browserslistEnv: process.env.BABEL_ENV || process.env.NODE_ENV,
        modules: useESModules ? false : 'commonjs',
        shippedProposals: api.env('modern'),
      },
    ],
    [
      '@babel/preset-react',
      {
        runtime: 'automatic',
      },
    ],
    '@babel/preset-typescript',
  ];

  const plugins = [
    '@babel/plugin-transform-react-constant-elements',
    ['@babel/plugin-proposal-object-rest-spread', { loose: true }],
    [
      '@babel/plugin-transform-runtime',
      {
        version: '^7.14.6',
      },
    ],
  ];

  return {
    assumptions: {
      noDocumentAll: true,
    },
    presets,
    plugins,
    ignore: [/@babel[\\|/]runtime/], // Fix a Windows issue.
  };
};
