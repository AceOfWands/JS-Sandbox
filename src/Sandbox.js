import SandboxException from './SandboxException.js';

export default class Sandbox{
	constructor(domStartNode = null, startingGlobal = null){
		this.globalContext = startingGlobal || {};
		this.dom = domStartNode || document;
		this.superDetectRegex = /super\.([^(]+)(\(?)/gm;
		this.ownerDocDetectRegex = /.ownerDocument/gm;
		this.domProxy = new Proxy(this.dom, {
			get: function(target, name) {
				if(name == 'body') return target;
				if(name == 'rootNode') return target;
				var ret;
				//Document node emulate
				if(name == 'nodeName' ||
					name == 'nodeType' ||
					name == 'ownerDocument' ||
					name == 'parentElement' ||
					name == 'parentNode'
				)
					ret = document[name];
				else
					ret = name in target ?
						target[name] :
						document[name];
				if( !(name in target) && (ret instanceof Function))
					ret = function(realFunc){
						var args = [];
						for (var i=0;(i+1)<arguments.length;i++) args[i]=arguments[i+1];
						return realFunc.apply(this, args);
					}.bind(document, ret);
				else if(ret instanceof Function){
					var step2ret = function(realFunc){
						var args = [];
						for (var i=0;(i+1)<arguments.length;i++) args[i]=arguments[i+1];
						return realFunc.apply(this, args);
					}.bind(target, ret);
					if(name == 'getElementsByTagName')
						ret = function(step2, htmlTag){
							if(htmlTag == 'body')
								return [this];
							else
								return step2.call(this, htmlTag);
						}.bind(target, step2ret);
					else
						ret = step2ret;
				}
				return ret;
			}.bind(document),
			set: function(target, property, value){
				var f = function(){
					this[property] = value;
				}.bind(target);
				f();
				return true;
			}
		});
		this.globalContextProxy = new Proxy(this.globalContext, {
			get: function(sandbox, target, name) {
				if(name == 'document') return sandbox.domProxy;
				var ret = name in target ?
				target[name] :
					window[name];
				if( !(name in target) && (ret instanceof Function))
					ret = function(realFunc){
						var args = [];
						for (var i=0;(i+1)<arguments.length;i++) args[i]=arguments[i+1];
						return realFunc.apply(this, args);
					}.bind(window, ret);
				return ret;
			}.bind(window, this)
		});
	}
	execCode(code, newcontext = this.globalContext){
		code = code.replace(this.ownerDocDetectRegex, '.s_ownerDocument');
		return (function(window, document, code) {
			var globalScopeInit = '';
			for(var x in window)
				globalScopeInit += 'var '+x+' = window["'+x+'"];';
			Node.prototype.s_ownerDocument = document;
			return eval(globalScopeInit+code);
		}.bind(newcontext))(this.globalContextProxy, this.domProxy, code);
	}
	execFunction(func, args, newcontext = this.globalContext){
		if(!(func instanceof Function) && !(typeof func == 'function')) throw new SandboxException("Object passed is not a function");
		return (function(window, document, owDocRegEx, func, args) {
			var globalScopeInit = '';
			for(var x in window)
				globalScopeInit += 'var '+x+' = window["'+x+'"];';
			var func_str = func.toString();
			if(!func_str.startsWith('function'))
				func_str = 'function ' + func_str;
			Node.prototype.s_ownerDocument = document;
			func_str = func_str.replace(owDocRegEx, '.s_ownerDocument');
			return eval(globalScopeInit+'('+func_str+'.bind(this)).apply(this,args)');
		}.bind(newcontext))(this.globalContextProxy, this.domProxy, this.ownerDocDetectRegex, func, args);
	}
	execMethod(meth, args, obj){
		if(!(obj[meth] instanceof Function) && !(typeof obj[meth] == 'function')) throw new SandboxException(meth + " is not a method");
		var func_str = obj[meth].toString();
		if(!func_str.startsWith('function'))
			func_str = 'function ' + func_str;
		func_str = func_str.replace(this.superDetectRegex, function(match, p1, p2){
			return '__super__.'+p1+'.bind(this)'+p2;
		});
		func_str = func_str.replace(this.ownerDocDetectRegex, '.s_ownerDocument');
		return (function(window, document, func_str, args) {
			var globalScopeInit = '';
			for(var x in window)
				globalScopeInit += 'var '+x+' = window["'+x+'"];';
			globalScopeInit += 'var __super__ = Object.getPrototypeOf(Object.getPrototypeOf(this));';
			var indx = func_str.indexOf('{') +1;
			Node.prototype.s_ownerDocument = document;
			return eval('('+[func_str.slice(0, indx), globalScopeInit, func_str.slice(indx)].join('')+').apply(this,args)');
		}.bind(obj))(this.globalContextProxy, this.domProxy, func_str, args);
	}
}