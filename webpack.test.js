const path = require('path');

module.exports = {
	mode: 'development',
	entry: {
		'test': './test/test.js'
	},
	target: 'node',
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, 'test', 'temp')
	}
};