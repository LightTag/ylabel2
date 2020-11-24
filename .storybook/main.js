module.exports = {
  stories: ["../src/**/*.stories.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/preset-create-react-app",
  ],
  webpackFinal: (config) => {
    config.target = "web";
    config.node = {
      module: "empty",
      dgram: "empty",
      dns: "mock",
      fs: "empty",
      http2: "empty",
      net: "empty",
      tls: "empty",
      child_process: "empty",
    };

    return config;
  },
  babel: async (options) => {
    const typescriptPreset = "@babel/preset-typescript";
    const presetIndex = options.presets.findIndex(
      (preset) =>
        (typeof preset === "string" && preset.match(typescriptPreset)) ||
        (Array.isArray(preset) &&
          preset[0] &&
          preset[0].match(typescriptPreset))
    );

    if (presetIndex >= 0) {
      const oldPreset = options.presets[presetIndex];
      if (Array.isArray(oldPreset) && oldPreset.length >= 2) {
        const title = oldPreset[0];
        const config = oldPreset[1];
        options.presets[presetIndex] = [
          title,
          {
            ...config,
            allowNamespaces: true,
          },
        ];
      } else {
        options.presets[presetIndex] = [
          oldPreset,
          {
            allowNamespaces: true,
          },
        ];
      }
    }

    return {
      ...options,
      // any extra options you want to set
      presets: [...options.presets],
    };
  },
};
