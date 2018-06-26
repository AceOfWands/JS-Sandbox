const path = require('path');

module.exports = {
	entry: {
		'js-sandbox': './src/Sandbox.js'
	},
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, 'dist')
	}
};