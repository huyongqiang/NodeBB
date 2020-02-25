'use strict';

const path = require('path');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const activePlugins = require('./build/active_plugins');

module.exports = {
	plugins: [
		new CleanWebpackPlugin(), // cleans dist folder
		new MiniCssExtractPlugin(), // extract css to separate file
		{
			apply: (compiler) => {
				compiler.hooks.watchRun.tap('nbbWatchPlugin', () => {
					// show changed files
					const watcher = compiler.watchFileSystem.watcher || compiler.watchFileSystem.wfs.watcher;
					const changedFiles = Object.keys(watcher.mtimes).map((f) => {
						if (f.startsWith(__dirname)) {
							f = f.slice(__dirname.length + 1);
						}
						return 'webpack:watchRun > ' + f;
					});
					if (changedFiles.length) {
						console.log(changedFiles.join('\n'));
					}
				});
			},
		},
	],
	entry: {
		app: './public/src/app.js',
		admin: './public/src/admin/admin.js',
	},
	output: {
		filename: '[name].bundle.js',
		chunkFilename: '[name].bundle.js',
		path: path.resolve(__dirname, 'dist'),
		publicPath: 'dist/',
	},
	watchOptions: {
		poll: 500,
		aggregateTimeout: 300,
	},
	resolve: {
		symlinks: false,
		modules: [
			'build/public/src/modules',
			'public/src',
			'public/src/modules',
			'public/src/client',
			'node_modules',
			...activePlugins.map(p => 'node_modules/' + p + '/node_modules'),
		],
		alias: {
			assets: path.resolve(__dirname, 'build/public'),
			forum: path.resolve(__dirname, 'public/src/client'),
			admin: path.resolve(__dirname, 'public/src/admin'),
			vendor: path.resolve(__dirname, 'public/vendor'),
			benchpress: path.resolve(__dirname, 'node_modules/benchpressjs'),
		},
	},
	node: { fs: 'empty' },
	externals: {
		nconf: 'nconf',
	},
	module: {
		rules: [
			{
				test: /\.tpl$/,
				use: [
					{
						loader: path.resolve('nbbTplLoader.js'),
						options: {},
					},
				],
			},
			// {
			// 	test: /\.js$/,
			// 	exclude: /(node_modules|bower_components)/,
			// 	use: {
			// 		loader: 'babel-loader',
			// 		options: {
			// 		  presets: ['@babel/preset-env']
			// 		}
			// 	}
			// },
			{
				test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
				loader: 'file-loader',
			},
			{
				test: /\.(scss|css)$/,
				use: [
					{
						loader: MiniCssExtractPlugin.loader,
					},
					// {
					// Adds CSS to the DOM by injecting a `<style>` tag
					// loader: 'style-loader'
					// },
					{
						// Interprets `@import` and `url()` like `import/require()` and will resolve them
						loader: 'css-loader',
					},
					{
						// Loader for webpack to process CSS with PostCSS
						loader: 'postcss-loader',
						options: {
							plugins: function () {
								return [
									require('autoprefixer'),
								];
							},
						},
					},
					{
						// Loads a SASS/SCSS file and compiles it to CSS
						loader: 'sass-loader',
					},
				],
			},
		],
	},
};
