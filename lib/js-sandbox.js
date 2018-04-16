class Sandbox{
	constructor(domStartNode = null, startingGlobal = null){
		this.globalContext = startingGlobal || {};
		this.dom = domStartNode || document;
		this.domProxy = new Proxy(this.dom, {
			get: function(target, name) {
				if(name == 'body') return target;
				if(name == 'rootNode') return target;
				var ret;
				//Document node emulate
				if(name == 'nodeName' ||
					name == 'nodeType' ||
					name == 'ownerDocument' ||
					name == 'parentElement'
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
								return step2.apply(this, arguments);
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
		(function(window, document, code) {
			var globalScopeInit = '';
			for(var x in window)
				globalScopeInit += 'var '+x+' = window["'+x+'"];';
			eval(globalScopeInit+code);
		}.bind(newcontext))(this.globalContextProxy, this.domProxy, code);
	}
	execFunction(func, args, newcontext = this.globalContext){
		if(!(func instanceof Function)) throw new Exception("Object passed is not a function");
		return (function(window, document, func, args) {
			var globalScopeInit = '';
			for(var x in window)
				globalScopeInit += 'var '+x+' = window["'+x+'"];';
			var func_str = func.toString();
			if(!func_str.startsWith('function'))
				func_str = 'function ' + func_str;
			return eval(globalScopeInit+'('+func_str+'.bind(this)).apply(this,args)');
		}.bind(newcontext))(this.globalContextProxy, this.domProxy, func, args);
	}
	execMethod(meth, args, obj){
		if(!(obj[meth] instanceof Function)) throw new Exception(meth + " is not a method");
		return (function(window, document, meth, args) {
			var globalScopeInit = '';
			for(var x in window)
				globalScopeInit += 'var '+x+' = window["'+x+'"];';
			return eval(globalScopeInit+'this.'+meth+'.apply(this,args);');
		}.bind(obj))(this.globalContextProxy, this.domProxy, meth, args);
	}
}
