module.exports = {
  presets: [
    "react-app",
    [
      "@babel/preset-typescript",
      {
        allowNamespaces: true,
      },
    ],
  ],
  plugins: ["const-enum"],
};
