/** @type {import('webpack'.Configuration)} */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ConsoleLogOnBuildWebpackPlugin = require('./plugin/ConsoleLogOnBuildWebpackPlugin');

module.exports = {
    mode: 'development',
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
    },
    plugins: [
        new ConsoleLogOnBuildWebpackPlugin(),
        new HtmlWebpackPlugin({ template: './src/index.html' }),
    ],
}