const HtmlWebpackPlugin = require('html-webpack-plugin');
// const HtmlMinimizerPlugin = require("html-minimizer-webpack-plugin");
const TerserPlugin = require('terser-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");

const utils = require('./webpack.config.utils');

module.exports = {
    context: utils.getPath('src'),
    mode: "production",
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
                    from: 'assets', to: '../dist'
                },
            ],
        }),
        new HtmlWebpackPlugin({
            title: "Webpack Test",
            template: "index.html",
            filename: "index.html",
            inject: "body",
            templateParameters: {
                titlePrefix: null
            },
            options: {
                title: "The Matrix reloaded"
            },
            minify: {
                useShortDoctype: true,
                collapseWhitespace: true,
                removeScriptTypeAttributes: true,
                html5: true,
                preserveLineBreaks: true,
                removeEmptyAttributes: true,
                removeRedundantAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                removeComments: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true,
            },
        }),
        new TerserPlugin({
            terserOptions: {
                compress: {
                    keep_classnames: false,
                    keep_fargs: false,
                    keep_fnames: /^livelyPropertyListener$/,
                    reduce_funcs: true
                }
            }
        }),
    ],
    optimization: {
        minimize: true,
        minimizer: [
            '...',
            new TerserPlugin({
                terserOptions: {
                    compress: {
                        keep_classnames: false,
                        keep_fargs: false,
                        keep_fnames: false,
                        reduce_funcs: true
                    }
                }
            })
        ],
    },
    devServer: {
        contentBase: './dist',
    },
}
