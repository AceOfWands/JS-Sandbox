const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
	mode: 'development',
	entry: {
		'test': './test/test.js'
	},
	target: 'node',
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, 'test', 'build')
	},
	externals: [nodeExternals()]
};