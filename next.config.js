const withPlugins = require('next-compose-plugins');

const withTypescript = require('@zeit/next-typescript');
const withCSS = require('@zeit/next-css');
const withSass = require('@zeit/next-sass');
// const withLess = require('@zeit/next-less');
const withLess = require('./customizeWithLessPlugins');
const lessToJS = require('less-vars-to-js');
const withBundleAnalyzer = require('@zeit/next-bundle-analyzer');
const nextRuntimeDotenv = require('next-runtime-dotenv');
const fs = require('fs');
const path = require('path');
const {
  PHASE_PRODUCTION_BUILD,
  PHASE_PRODUCTION_SERVER,
  PHASE_DEVELOPMENT_SERVER,
  PHASE_EXPORT,
} = require('next/constants');
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

const themeVariables = require('./theme.config')();

const withConfig = nextRuntimeDotenv({
  public: ['API_URL'],
});

// Where your antd-custom.less file lives
// const themeVariables = lessToJS(
//   fs.readFileSync(path.resolve(__dirname, './styles/antd-custom.less'), 'utf8')
// );

// fix: prevents error when .less files are required by node
if (typeof require !== 'undefined') {
  // eslint-disable-next-line node/no-deprecated-api
  require.extensions['.less'] = file => {};
}

module.exports = withPlugins(
  [
    [withTypescript],
    [withCSS],
    [withCSS, {
      cssModules: true,
      cssLoaderOptions: {
        localIdentName: '[path]___[local]___[hash:base64:5]',
      },
      [PHASE_PRODUCTION_BUILD]: {
        cssLoaderOptions: {
          localIdentName: '[hash:base64:8]',
        },
      },
    }],
    [
      withLess,
      {
        include: [
          path.resolve(__dirname, 'components'),
          path.resolve(__dirname, 'pages'),
        ],
        // cssModules: true,
        // cssLoaderOptions: {
        //   localIdentName: '[path]___[local]___[hash:base64:5]',
        // },
        // [PHASE_PRODUCTION_BUILD]: {
        //   cssLoaderOptions: {
        //     localIdentName: '[hash:base64:8]',
        //   },
        // },
        lessLoaderOptions: {
          javascriptEnabled: true,
          modifyVars: themeVariables, // make your antd custom effective
        },
      },
    ],
    [
      withLess,
      {
        include: [
          path.resolve(__dirname,'node_modules'),
          path.resolve(__dirname, 'themes')
        ],
        cssModules: false,
        lessLoaderOptions: {
          javascriptEnabled: true,
          modifyVars: themeVariables, // make your antd custom effective
        },
      },
    ],
    [withSass],
    [withConfig],
    [withBundleAnalyzer],
  ],
  {
    analyzeServer: ['server', 'both'].includes(process.env.BUNDLE_ANALYZE),
    analyzeBrowser: ['browser', 'both'].includes(process.env.BUNDLE_ANALYZE),
    bundleAnalyzerConfig: {
      server: {
        analyzerMode: 'static',
        reportFilename: '../bundles/server.html',
      },
      browser: {
        analyzerMode: 'static',
        reportFilename: '../bundles/client.html',
      },
    },
    webpack: config => {
      // Fixes npm packages that depend on `fs` module
      config.node = {
        fs: 'empty',
      };
      // Added aliases
      config.resolve.alias = {
        '@root': path.join(__dirname),
        config: path.resolve(__dirname, 'lib/config.shim'),
        themes: path.resolve(__dirname, 'themes/'),
      };
      if (config.mode === 'production') {
        if (Array.isArray(config.optimization.minimizer)) {
          config.optimization.minimizer.push(new OptimizeCSSAssetsPlugin({}));
        }
      }
      return config;
    },
  }
);
