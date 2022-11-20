const HtmlWebpackPlugin = require('html-webpack-plugin');
// const HtmlMinimizerPlugin = require("html-minimizer-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

const utils = require('./webpack.config.utils');

module.exports = {
    context: utils.getPath('src'),
    mode: 'development',
    devtool: 'inline-source-map',
    entry: {
        index: './index.ts'
    },
    output: {
        iife: false,
        clean: true,
        path: utils.getPath('dist'),
        // filename: '[name].[contenthash].bundle.js',
        filename: 'index.js',
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader'
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                {
                    from: '../assets', to: '.'
                },
            ],
        }),
        new HtmlWebpackPlugin({
            title: 'Webpack Test',
            template: 'index.html',
            filename: 'index.html',
            inject: 'body',
            templateParameters: {
                titlePrefix: 'Dev - '
            },
            options: {
                title: 'The Matrix reloaded'
            },
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: false,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: false,
            },
        })
    ]
};
