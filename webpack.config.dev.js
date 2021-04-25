const HtmlWebpackPlugin = require('html-webpack-plugin');
// const HtmlMinimizerPlugin = require("html-minimizer-webpack-plugin");
// const CopyPlugin = require("copy-webpack-plugin");

const path = require('path');

module.exports = {
    context: path.resolve(__dirname, 'src'),
    mode: "development",
    devtool: 'inline-source-map',
    entry: {
        index: './index.ts'
    },
    output: {
        clean: true,
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].[contenthash].bundle.js',
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader'
            },
            // {
            //     test: /\.html$/,
            //     type: 'asset/resource',
            //     generator: {
            //         filename: '[name][ext]',
            //     },
            // },
            // {
            //     test: /\.html$/i,
            //     use: ['extract-loader', 'html-loader'],
            // },
        ],
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
    },
    plugins: [
        // new CopyPlugin({
        //     patterns: [
        //         {
        //             context: path.resolve(__dirname, "src"),
        //             from: "./**/*.html",
        //         },
        //         // {
        //         //     context: path.resolve(__dirname, "src"),
        //         //     from: "**/*.js",
        //         // },
        //     ],
        // }),
        new HtmlWebpackPlugin({
            title: "Webpack Test",
            template: "index.html",
            filename: "index.html",
            inject: "body",
            templateParameters: {
                titlePrefix: "Dev - "
            },
            options: {
                title: "The Matrix reloaded"
            },
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true,
            },
        })
    ],
    // optimization: {
    //     minimize: true,
    //     minimizer: [
    //         // For webpack@5 you can use the `...` syntax to extend existing minimizers (i.e. `terser-webpack-plugin`), uncomment the next line
    //         `...`,
    //         new HtmlMinimizerPlugin({
    //             // test: /\.html(\?.*)?$/i,
    //             minimizerOptions: {
    //                 caseSensitive: true,
    //                 collapseWhitespace: true,
    //                 conservativeCollapse: true,
    //                 keepClosingSlash: true,
    //                 minifyCSS: true,
    //                 minifyJS: true,
    //                 removeComments: true,
    //                 removeScriptTypeAttributes: true,
    //                 removeStyleLinkTypeAttributes: true,
    //             },
    //             minify: (data, minimizerOptions) => {
    //                 const htmlMinifier = require("html-minifier-terser");
    //                 const [[filename, input]] = Object.entries(data);

    //                 return htmlMinifier.minify(input, minimizerOptions);
    //             }
    //         }),
    //     ],
    // },
    devServer: {
        contentBase: './dist',
    },
};
