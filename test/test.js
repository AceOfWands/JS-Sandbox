import Sandbox from '../src/Sandbox.js';
var assert = require('assert');
require('browser-env')(['document','window','Node']);

var div = document.createElement('div');
var div2 = document.createElement('div');
document.body.appendChild(div);
document.body.appendChild(div2);
var context = {a:123};

var Function = window.Function;
var Exception = window.Exception;

describe('Sandbox', function() {
	var sandbox = new Sandbox(div,context);
	describe('#constructor()', function(){
		it('the new Sandbox object context should be the same object passed to constructor',function(){
			assert.equal(sandbox.globalContext, context);
		});
		it('the new Sandbox object document should be the same dom element passed to constructor',function(){
			assert.equal(sandbox.dom, div);
		});
	});
	describe('execCode', function(){
		var res = sandbox.execCode('window.a = 1; var b = 5; window.a + b;');
		it('correct execution of the code',function(){
			assert.equal(res, 6);
		});
		it('isolation of the code execution',function(){
			assert.equal(window.a, assert.undefined);
			assert.equal(window.a, assert.null);
		});
		var res2 = sandbox.execCode('var b = 7; window.a + b;');
		it('shared global context',function(){
			assert.equal(res2, 8);
		});
	});
	describe('execFunction', function(){
		var res = sandbox.execFunction(function(_d,_e){window.d = _d; var e = _e; return window.d + e;}, [1,5]);
		it('correct execution of the code',function(){
			assert.equal(res, 6);
		});
		it('isolation of the code execution',function(){
			assert.equal(window.a, assert.undefined);
			assert.equal(window.a, assert.null);
		});
		var res2 = sandbox.execFunction(function(_e){var e = _e; return window.d + e;}, [7]);
		it('shared global context',function(){
			assert.equal(res2, 8);
		});
	});
	describe('execMethod', function(){
		class A{
			constructor(){
				this.c = 2;
				this.b = 1;
			}
			test(b){
				window.a = 1;
				this.b = b;
				return window.a + this.b + this.c;
			}
			test2(){
				window.a = 3;
				return window.a + this.b + this.c;
			}
		}
		var resObj = new A();
		var res = sandbox.execMethod('test',[5],resObj);
		it('correct execution of the code',function(){
			assert.equal(res, 8);
		});
		it('isolation of the code execution',function(){
			assert.equal(window.a, assert.undefined);
			assert.equal(window.a, assert.null);
		});
		var res2 = sandbox.execMethod('test2',null,resObj);
		it('shared object context',function(){
			assert.equal(res2, 10);
		});
	});
});