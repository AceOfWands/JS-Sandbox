var assert = require('assert');
var jsdom = require("jsdom");
var Sandbox = require("js-sandbox");
var dom = new jsdom.JSDOM(`<body><div><span id="1"></span></div></body>`);
var domDiv = dom.window.document.body.querySelector('div');
var context = {a:123};
describe('Sandbox', function() {
	describe('#constructor()', function() {
		it('should return a Sandbox object with dom as simple div and globalContext as object {a:123}', function() {
			var sandbox = new Sandbox(domDiv,context);
			assert.equal(sandbox.globalContext, context);
			assert.equal(sandbox.dom, domDiv);
		});
	});
});