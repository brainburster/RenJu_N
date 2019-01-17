const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  target: 'web',
  entry: ['babel-polyfill', './src/js/renju.js'],
  output: {
    path: path.resolve(__dirname, './public'),
    filename: './js/renju.min.js'
  },
  mode: 'production',
  // mode: 'development',
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: path.resolve(__dirname, 'node_modules'),
        include: path.resolve(__dirname, 'src')
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'AI五子棋',
      template: path.resolve(__dirname, 'src', 'index.html'),
      inject: 'head',
      favicon: false
    }),
    new CopyWebpackPlugin([{
      from: path.resolve(__dirname, 'src'),
      to: './',
      ignore: ['*.js', '*.html', '*.md']
    }])
  ]
}
