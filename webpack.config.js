const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    entry: './src/main.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? 'spicy-accessibility.min.js' : 'spicy-accessibility.js',
      library: 'SpicyAccessibility',
      libraryTarget: 'umd',
      libraryExport: 'default',
      umdNamedDefine: true,
      globalObject: 'this'
    },
    module: {
      rules: [
        {
          test: /\.(js|ts)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-typescript']
            }
          }
        },
        {
          test: /\.css$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader'
          ]
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'assets/images/[name][ext]'
          }
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'assets/fonts/[name][ext]'
          }
        }
      ]
    },
    resolve: {
      extensions: ['.js', '.ts', '.json'],
      alias: {
        '@': path.resolve(__dirname, 'src/')
      }
    },
    plugins: [
      new CleanWebpackPlugin(),
      new MiniCssExtractPlugin({
        filename: isProduction ? 'spicy-accessibility.min.css' : 'spicy-accessibility.css'
      }),
      new HtmlWebpackPlugin({
        template: './examples/basic/index.html',
        filename: 'index.html',
        inject: 'head'
      }),
      new CopyPlugin({
        patterns: [
          { 
            from: './assets', 
            to: 'assets',
            noErrorOnMissing: true
          },
          {
            from: './LICENSE',
            to: '.',
            noErrorOnMissing: true
          }
        ]
      })
    ],
    optimization: {
      minimize: isProduction,
      minimizer: [
        new TerserPlugin({
          extractComments: false,
          terserOptions: {
            format: {
              comments: false
            }
          }
        }),
        new CssMinimizerPlugin()
      ]
    },
    devServer: {
      static: {
        directory: path.join(__dirname, 'dist')
      },
      hot: true,
      port: 9000,
      open: true
    },
    devtool: isProduction ? false : 'source-map'
  };
};
