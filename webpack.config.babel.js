import webpack from 'webpack'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import { VueLoaderPlugin } from 'vue-loader'

const mode = process.env.NODE_ENV || 'development'

export default {
  mode,
  target: 'web',
  context: `${__dirname}/src`,
  entry: {
    background: './background',
    'content-script': './content-script',
    options: './options',
    popup: './popup'
  },
  output: {
    path: `${__dirname}/app/`,
    filename: '[name].js',
    publicPath: '../'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.css$/,
        use: ['vue-style-loader', 'css-loader']
      },
      {
        test: /\.(jpg|gif|png|woff|woff2|eot|ttf)$/,
        loader: 'file-loader',
        options: {
          name: 'assets/[name].[ext]'
        }
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(mode)
      }
    }),
    new CopyWebpackPlugin([
      {
        from: 'manifest.json',
        transform: function(content) {
          return Buffer.from(
            JSON.stringify({
              ...JSON.parse(content.toString()),
              name: process.env.npm_package_productName,
              description: process.env.npm_package_description,
              version: process.env.npm_package_version
            })
          )
        }
      }
    ]),
    new HtmlWebpackPlugin({
      template: './assets/popup.html',
      filename: './assets/popup.html',
      chunks: ['popup']
    }),
    new HtmlWebpackPlugin({
      template: './assets/options.html',
      filename: './assets/options.html',
      chunks: ['options']
    }),
    new VueLoaderPlugin()
  ],
  resolve: {
    extensions: ['.js', '.json', '.vue'],
    alias: {
      '~~': `${__dirname}/`,
      '~': `${__dirname}/src/`,
      vue$: 'vue/dist/vue.esm.js'
    }
  }
}
