const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Ensure the output is treated as an ES module.
  if (config.output) {
    config.output.module = true;
  }
  if (config.experiments) {
    config.experiments.outputModule = true;
  } else {
    config.experiments = { outputModule: true };
  }

  // Customize the config before returning it.
  return config;
};
