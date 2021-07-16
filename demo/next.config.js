const path = require('path');

const packageSourceFolder = path.resolve(__dirname, '../src');
const testsFolder = path.resolve(__dirname, '../test');

module.exports = {
  webpack: (config, options) => {
    // Ensure we use the local version of react so we don't get version mismatch when
    // webpack is resolving `react` in the package source folder
    config.resolve.alias.react = path.resolve(__dirname, 'node_modules/react');

    // To allow transpiling the package source folder
    config.module.rules.push({
      test: /\.+(js|jsx|mjs|ts|tsx)$/,
      use: options.defaultLoaders.babel,
      include: [packageSourceFolder, testsFolder],
    });

    return config;
  },
};
