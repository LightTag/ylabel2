var webpack = require("webpack");
var path = require("path");
var package = require("./package.json");

// variables
var isProduction =
  process.argv.indexOf("-p") >= 0 || process.env.NODE_ENV === "production";
var sourcePath = path.join(__dirname, "./src");
var outPath = path.join(__dirname, "./build");

// plugins
var HtmlWebpackPlugin = require("html-webpack-plugin");
var MiniCssExtractPlugin = require("mini-css-extract-plugin");
var { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  context: sourcePath,
  entry: {
    app: "./index.tsx",
  },
  output: {
    path: outPath,
    filename: isProduction ? "[contenthash].js" : "[hash].js",
    chunkFilename: isProduction
      ? "[name].[contenthash].js"
      : "[name].[hash].js",
  },
  target: "web",
  resolve: {
    extensions: [".js", ".ts", ".tsx"],
    // Fix webpack's default behavior to not load packages with jsnext:main module
    // (jsnext:main directs not usually distributable es6 format, but es6 sources)
    mainFields: ["module", "browser", "main"],

    alias: {
      app: path.resolve(__dirname, "src/app/"),
    },
  },
  module: {
    rules: [
      {
        test: /\.wasm$/i,
        type: "javascript/auto",
        use: [
          'cache-loader',
          {
            loader: "file-loader",
          },
        ],
        include: sourcePath,
      },
      //workers
      {
        test: /\.worker\.(c|m)?js$/i,
        include: sourcePath,
        use: ['cache-loader',
          {
            loader: "worker-loader",
          },
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"],
            },
          },
        ],
      },
      // .ts, .tsx
      {
        test: /\.tsx?$/,
        include: sourcePath,
        use: [
          'cache-loader',
          !isProduction && {
            loader: "babel-loader",
            options: { plugins: ["react-hot-loader/babel"] },
          },
          "ts-loader",
        ].filter(Boolean),
      },
      // css
      {
        test: /\.css$/,
        use: [
          isProduction ? MiniCssExtractPlugin.loader : "style-loader",
          {
            loader: "css-loader",
            query: {
              sourceMap: !isProduction,
              importLoaders: 1,
            },
          },
          {
            loader: "postcss-loader",
            options: {
              ident: "postcss",
              plugins: [
                require("postcss-import")({ addDependencyTo: webpack }),
                require("postcss-url")(),
                require("postcss-preset-env")({
                  /* use stage 2 features (defaults) */
                  stage: 2,
                }),
                require("postcss-reporter")(),
                require("postcss-browser-reporter")({
                  disabled: isProduction,
                }),
              ],
            },
          },
        ],
      },
      // static assets
      { test: /\.html$/, use: "html-loader", include: sourcePath },
      {
        test: /\.(a?png|svg)$/,
        use: "url-loader?limit=10000",
        include: sourcePath,
      },
      {
        test: /\.(jpe?g|gif|bmp|mp3|mp4|ogg|wav|eot|ttf|woff|woff2)$/,
        use: "file-loader",
      },
    ],
  },
  optimization: {
    removeAvailableModules: isProduction ? true : false,
    removeEmptyChunks: isProduction ? true : false,
    splitChunks: isProduction
      ? {
          name: true,
          cacheGroups: {
            commons: {
              chunks: "initial",
              minChunks: 2,
            },
            vendors: {
              test: /[\\/]node_modules[\\/]/,
              chunks: "all",
              filename: isProduction
                ? "vendor.[contenthash].js"
                : "vendor.[hash].js",
              priority: -10,
            },
          },
        }
      : false,
    runtimeChunk: true,
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: "development", // use 'development' unless process.env.NODE_ENV is defined
      DEBUG: false,
    }),
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: "[hash].css",
      disable: !isProduction,
    }),
    new HtmlWebpackPlugin({
      template: "assets/index.html",
      minify: {
        minifyJS: true,
        minifyCSS: true,
        removeComments: true,
        useShortDoctype: true,
        collapseWhitespace: true,
        collapseInlineTagWhitespace: true,
      },
      append: {
        head: `<script src="//cdn.polyfill.io/v3/polyfill.min.js"></script> <script src="https://cdn.jsdelivr.net/npm/machinelearn/machinelearn.min.js"></script>
`,
      },
      meta: {
        title: package.name,
        description: package.description,
        keywords: Array.isArray(package.keywords)
          ? package.keywords.join(",")
          : undefined,
      },
    }),
  ],
  devServer: {
    contentBase: sourcePath,
    hot: true,
    inline: true,
    historyApiFallback: {
      disableDotRule: true,
    },
    stats: "minimal",
    clientLogLevel: "warning",
  },
  // https://webpack.js.org/configuration/devtool/
  devtool: isProduction ? "hidden-source-map" : "cheap-module-eval-source-map",
  node: {
    // workaround for webpack-dev-server issue
    // https://github.com/webpack/webpack-dev-server/issues/60#issuecomment-103411179
    fs: "empty",
    net: "empty",
  },
};
