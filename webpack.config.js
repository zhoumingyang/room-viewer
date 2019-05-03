const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    target: 'web',
    entry: './src/index.tsx',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, './dist'),
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx']
    },
    devtool: process.env.NODE_ENV === 'production' ? false : 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "awesome-typescript-loader",
                exclude: [/node_modules/, /lib/],
            },
            {
                enforce: "pre",
                test: /\.js$/,
                loaders: ['source-map-loader', 'babel-loader'],
                exclude: [/node_modules/, /lib/],
            },
            {
                test: /\.css$/,
                loaders: ['style-loader', 'css-loader'],
                exclude: [/node_modules/, /lib/],
            },
            {
                test: /\.(png|woff|woff2|eot|ttf|svg)$/,
                loader: 'file-loader',
            },
            {
                test: /\.woff|\.woff2|\.svg|.eot|\.ttf/,
                loader: 'url-loader?prefix=font/&limit=10000',
            }
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            THREE: "three",
        }),

        new HtmlWebpackPlugin({
            title: 'room viewer',
            filename: 'index.html',
            template: './template.html',
        }),
        // new UglifyJsPlugin({
        //     sourceMap: true,
        //     uglifyOptions: {
        //         output: {
        //             beautify: false,
        //             comments: false,
        //         }
        //     }
        // }),
        new CopyWebpackPlugin([
            {
                from: path.join(__dirname, './res/wall_stucco_16x16.png'),
                to: path.join(__dirname, './dist/res/wall_stucco_16x16.png'),
            },
            {
                from: path.join(__dirname, './res/wall_stucco.jpg'),
                to: path.join(__dirname, './dist/res/wall_stucco.jpg'),
            },
            {
                from: path.join(__dirname, './res/white.jpg'),
                to: path.join(__dirname, './dist/res/white.jpg'),
            },
            {
                from: path.join(__dirname, './res/wood.png'),
                to: path.join(__dirname, './dist/res/wood.png'),
            }
        ])
    ]
};