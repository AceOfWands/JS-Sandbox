/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/Sandbox.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/Sandbox.js":
/*!************************!*\
  !*** ./src/Sandbox.js ***!
  \************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Sandbox; });
class Sandbox{
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
		(function(window, document, code) {
			var globalScopeInit = '';
			for(var x in window)
				globalScopeInit += 'var '+x+' = window["'+x+'"];';
			Node.prototype.s_ownerDocument = document;
			eval(globalScopeInit+code);
		}.bind(newcontext))(this.globalContextProxy, this.domProxy, code);
	}
	execFunction(func, args, newcontext = this.globalContext){
		if(!(func instanceof Function)) throw new Exception("Object passed is not a function");
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
		if(!(obj[meth] instanceof Function)) throw new Exception(meth + " is not a method");
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


/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL1NhbmRib3guanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esa0RBQTBDLGdDQUFnQztBQUMxRTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGdFQUF3RCxrQkFBa0I7QUFDMUU7QUFDQSx5REFBaUQsY0FBYztBQUMvRDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaURBQXlDLGlDQUFpQztBQUMxRSx3SEFBZ0gsbUJBQW1CLEVBQUU7QUFDckk7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7O0FBR0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7O0FDbEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsdUJBQXVCO0FBQzFDO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQix1QkFBdUI7QUFDMUM7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLHVCQUF1QjtBQUMxQztBQUNBLE1BQU07QUFDTjtBQUNBLElBQUk7QUFDSixHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0RBQW9EO0FBQ3BEO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0RBQW9EO0FBQ3BEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0RBQW9EO0FBQ3BELDBGQUEwRjtBQUMxRixpQ0FBaUM7QUFDakM7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBIiwiZmlsZSI6ImpzLXNhbmRib3guanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL3NyYy9TYW5kYm94LmpzXCIpO1xuIiwiZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2FuZGJveHtcclxuXHRjb25zdHJ1Y3Rvcihkb21TdGFydE5vZGUgPSBudWxsLCBzdGFydGluZ0dsb2JhbCA9IG51bGwpe1xyXG5cdFx0dGhpcy5nbG9iYWxDb250ZXh0ID0gc3RhcnRpbmdHbG9iYWwgfHwge307XHJcblx0XHR0aGlzLmRvbSA9IGRvbVN0YXJ0Tm9kZSB8fCBkb2N1bWVudDtcclxuXHRcdHRoaXMuc3VwZXJEZXRlY3RSZWdleCA9IC9zdXBlclxcLihbXihdKykoXFwoPykvZ207XHJcblx0XHR0aGlzLm93bmVyRG9jRGV0ZWN0UmVnZXggPSAvLm93bmVyRG9jdW1lbnQvZ207XHJcblx0XHR0aGlzLmRvbVByb3h5ID0gbmV3IFByb3h5KHRoaXMuZG9tLCB7XHJcblx0XHRcdGdldDogZnVuY3Rpb24odGFyZ2V0LCBuYW1lKSB7XHJcblx0XHRcdFx0aWYobmFtZSA9PSAnYm9keScpIHJldHVybiB0YXJnZXQ7XHJcblx0XHRcdFx0aWYobmFtZSA9PSAncm9vdE5vZGUnKSByZXR1cm4gdGFyZ2V0O1xyXG5cdFx0XHRcdHZhciByZXQ7XHJcblx0XHRcdFx0Ly9Eb2N1bWVudCBub2RlIGVtdWxhdGVcclxuXHRcdFx0XHRpZihuYW1lID09ICdub2RlTmFtZScgfHxcclxuXHRcdFx0XHRcdG5hbWUgPT0gJ25vZGVUeXBlJyB8fFxyXG5cdFx0XHRcdFx0bmFtZSA9PSAnb3duZXJEb2N1bWVudCcgfHxcclxuXHRcdFx0XHRcdG5hbWUgPT0gJ3BhcmVudEVsZW1lbnQnIHx8XHJcblx0XHRcdFx0XHRuYW1lID09ICdwYXJlbnROb2RlJ1xyXG5cdFx0XHRcdClcclxuXHRcdFx0XHRcdHJldCA9IGRvY3VtZW50W25hbWVdO1xyXG5cdFx0XHRcdGVsc2VcclxuXHRcdFx0XHRcdHJldCA9IG5hbWUgaW4gdGFyZ2V0ID9cclxuXHRcdFx0XHRcdFx0dGFyZ2V0W25hbWVdIDpcclxuXHRcdFx0XHRcdFx0ZG9jdW1lbnRbbmFtZV07XHJcblx0XHRcdFx0aWYoICEobmFtZSBpbiB0YXJnZXQpICYmIChyZXQgaW5zdGFuY2VvZiBGdW5jdGlvbikpXHJcblx0XHRcdFx0XHRyZXQgPSBmdW5jdGlvbihyZWFsRnVuYyl7XHJcblx0XHRcdFx0XHRcdHZhciBhcmdzID0gW107XHJcblx0XHRcdFx0XHRcdGZvciAodmFyIGk9MDsoaSsxKTxhcmd1bWVudHMubGVuZ3RoO2krKykgYXJnc1tpXT1hcmd1bWVudHNbaSsxXTtcclxuXHRcdFx0XHRcdFx0cmV0dXJuIHJlYWxGdW5jLmFwcGx5KHRoaXMsIGFyZ3MpO1xyXG5cdFx0XHRcdFx0fS5iaW5kKGRvY3VtZW50LCByZXQpO1xyXG5cdFx0XHRcdGVsc2UgaWYocmV0IGluc3RhbmNlb2YgRnVuY3Rpb24pe1xyXG5cdFx0XHRcdFx0dmFyIHN0ZXAycmV0ID0gZnVuY3Rpb24ocmVhbEZ1bmMpe1xyXG5cdFx0XHRcdFx0XHR2YXIgYXJncyA9IFtdO1xyXG5cdFx0XHRcdFx0XHRmb3IgKHZhciBpPTA7KGkrMSk8YXJndW1lbnRzLmxlbmd0aDtpKyspIGFyZ3NbaV09YXJndW1lbnRzW2krMV07XHJcblx0XHRcdFx0XHRcdHJldHVybiByZWFsRnVuYy5hcHBseSh0aGlzLCBhcmdzKTtcclxuXHRcdFx0XHRcdH0uYmluZCh0YXJnZXQsIHJldCk7XHJcblx0XHRcdFx0XHRpZihuYW1lID09ICdnZXRFbGVtZW50c0J5VGFnTmFtZScpXHJcblx0XHRcdFx0XHRcdHJldCA9IGZ1bmN0aW9uKHN0ZXAyLCBodG1sVGFnKXtcclxuXHRcdFx0XHRcdFx0XHRpZihodG1sVGFnID09ICdib2R5JylcclxuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBbdGhpc107XHJcblx0XHRcdFx0XHRcdFx0ZWxzZVxyXG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHN0ZXAyLmNhbGwodGhpcywgaHRtbFRhZyk7XHJcblx0XHRcdFx0XHRcdH0uYmluZCh0YXJnZXQsIHN0ZXAycmV0KTtcclxuXHRcdFx0XHRcdGVsc2VcclxuXHRcdFx0XHRcdFx0cmV0ID0gc3RlcDJyZXQ7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdHJldHVybiByZXQ7XHJcblx0XHRcdH0uYmluZChkb2N1bWVudCksXHJcblx0XHRcdHNldDogZnVuY3Rpb24odGFyZ2V0LCBwcm9wZXJ0eSwgdmFsdWUpe1xyXG5cdFx0XHRcdHZhciBmID0gZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRcdHRoaXNbcHJvcGVydHldID0gdmFsdWU7XHJcblx0XHRcdFx0fS5iaW5kKHRhcmdldCk7XHJcblx0XHRcdFx0ZigpO1xyXG5cdFx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHRcdHRoaXMuZ2xvYmFsQ29udGV4dFByb3h5ID0gbmV3IFByb3h5KHRoaXMuZ2xvYmFsQ29udGV4dCwge1xyXG5cdFx0XHRnZXQ6IGZ1bmN0aW9uKHNhbmRib3gsIHRhcmdldCwgbmFtZSkge1xyXG5cdFx0XHRcdGlmKG5hbWUgPT0gJ2RvY3VtZW50JykgcmV0dXJuIHNhbmRib3guZG9tUHJveHk7XHJcblx0XHRcdFx0dmFyIHJldCA9IG5hbWUgaW4gdGFyZ2V0ID9cclxuXHRcdFx0XHR0YXJnZXRbbmFtZV0gOlxyXG5cdFx0XHRcdFx0d2luZG93W25hbWVdO1xyXG5cdFx0XHRcdGlmKCAhKG5hbWUgaW4gdGFyZ2V0KSAmJiAocmV0IGluc3RhbmNlb2YgRnVuY3Rpb24pKVxyXG5cdFx0XHRcdFx0cmV0ID0gZnVuY3Rpb24ocmVhbEZ1bmMpe1xyXG5cdFx0XHRcdFx0XHR2YXIgYXJncyA9IFtdO1xyXG5cdFx0XHRcdFx0XHRmb3IgKHZhciBpPTA7KGkrMSk8YXJndW1lbnRzLmxlbmd0aDtpKyspIGFyZ3NbaV09YXJndW1lbnRzW2krMV07XHJcblx0XHRcdFx0XHRcdHJldHVybiByZWFsRnVuYy5hcHBseSh0aGlzLCBhcmdzKTtcclxuXHRcdFx0XHRcdH0uYmluZCh3aW5kb3csIHJldCk7XHJcblx0XHRcdFx0cmV0dXJuIHJldDtcclxuXHRcdFx0fS5iaW5kKHdpbmRvdywgdGhpcylcclxuXHRcdH0pO1xyXG5cdH1cclxuXHRleGVjQ29kZShjb2RlLCBuZXdjb250ZXh0ID0gdGhpcy5nbG9iYWxDb250ZXh0KXtcclxuXHRcdGNvZGUgPSBjb2RlLnJlcGxhY2UodGhpcy5vd25lckRvY0RldGVjdFJlZ2V4LCAnLnNfb3duZXJEb2N1bWVudCcpO1xyXG5cdFx0KGZ1bmN0aW9uKHdpbmRvdywgZG9jdW1lbnQsIGNvZGUpIHtcclxuXHRcdFx0dmFyIGdsb2JhbFNjb3BlSW5pdCA9ICcnO1xyXG5cdFx0XHRmb3IodmFyIHggaW4gd2luZG93KVxyXG5cdFx0XHRcdGdsb2JhbFNjb3BlSW5pdCArPSAndmFyICcreCsnID0gd2luZG93W1wiJyt4KydcIl07JztcclxuXHRcdFx0Tm9kZS5wcm90b3R5cGUuc19vd25lckRvY3VtZW50ID0gZG9jdW1lbnQ7XHJcblx0XHRcdGV2YWwoZ2xvYmFsU2NvcGVJbml0K2NvZGUpO1xyXG5cdFx0fS5iaW5kKG5ld2NvbnRleHQpKSh0aGlzLmdsb2JhbENvbnRleHRQcm94eSwgdGhpcy5kb21Qcm94eSwgY29kZSk7XHJcblx0fVxyXG5cdGV4ZWNGdW5jdGlvbihmdW5jLCBhcmdzLCBuZXdjb250ZXh0ID0gdGhpcy5nbG9iYWxDb250ZXh0KXtcclxuXHRcdGlmKCEoZnVuYyBpbnN0YW5jZW9mIEZ1bmN0aW9uKSkgdGhyb3cgbmV3IEV4Y2VwdGlvbihcIk9iamVjdCBwYXNzZWQgaXMgbm90IGEgZnVuY3Rpb25cIik7XHJcblx0XHRyZXR1cm4gKGZ1bmN0aW9uKHdpbmRvdywgZG9jdW1lbnQsIG93RG9jUmVnRXgsIGZ1bmMsIGFyZ3MpIHtcclxuXHRcdFx0dmFyIGdsb2JhbFNjb3BlSW5pdCA9ICcnO1xyXG5cdFx0XHRmb3IodmFyIHggaW4gd2luZG93KVxyXG5cdFx0XHRcdGdsb2JhbFNjb3BlSW5pdCArPSAndmFyICcreCsnID0gd2luZG93W1wiJyt4KydcIl07JztcclxuXHRcdFx0dmFyIGZ1bmNfc3RyID0gZnVuYy50b1N0cmluZygpO1xyXG5cdFx0XHRpZighZnVuY19zdHIuc3RhcnRzV2l0aCgnZnVuY3Rpb24nKSlcclxuXHRcdFx0XHRmdW5jX3N0ciA9ICdmdW5jdGlvbiAnICsgZnVuY19zdHI7XHJcblx0XHRcdE5vZGUucHJvdG90eXBlLnNfb3duZXJEb2N1bWVudCA9IGRvY3VtZW50O1xyXG5cdFx0XHRmdW5jX3N0ciA9IGZ1bmNfc3RyLnJlcGxhY2Uob3dEb2NSZWdFeCwgJy5zX293bmVyRG9jdW1lbnQnKTtcclxuXHRcdFx0cmV0dXJuIGV2YWwoZ2xvYmFsU2NvcGVJbml0KycoJytmdW5jX3N0cisnLmJpbmQodGhpcykpLmFwcGx5KHRoaXMsYXJncyknKTtcclxuXHRcdH0uYmluZChuZXdjb250ZXh0KSkodGhpcy5nbG9iYWxDb250ZXh0UHJveHksIHRoaXMuZG9tUHJveHksIHRoaXMub3duZXJEb2NEZXRlY3RSZWdleCwgZnVuYywgYXJncyk7XHJcblx0fVxyXG5cdGV4ZWNNZXRob2QobWV0aCwgYXJncywgb2JqKXtcclxuXHRcdGlmKCEob2JqW21ldGhdIGluc3RhbmNlb2YgRnVuY3Rpb24pKSB0aHJvdyBuZXcgRXhjZXB0aW9uKG1ldGggKyBcIiBpcyBub3QgYSBtZXRob2RcIik7XHJcblx0XHR2YXIgZnVuY19zdHIgPSBvYmpbbWV0aF0udG9TdHJpbmcoKTtcclxuXHRcdGlmKCFmdW5jX3N0ci5zdGFydHNXaXRoKCdmdW5jdGlvbicpKVxyXG5cdFx0XHRmdW5jX3N0ciA9ICdmdW5jdGlvbiAnICsgZnVuY19zdHI7XHJcblx0XHRmdW5jX3N0ciA9IGZ1bmNfc3RyLnJlcGxhY2UodGhpcy5zdXBlckRldGVjdFJlZ2V4LCBmdW5jdGlvbihtYXRjaCwgcDEsIHAyKXtcclxuXHRcdFx0cmV0dXJuICdfX3N1cGVyX18uJytwMSsnLmJpbmQodGhpcyknK3AyO1xyXG5cdFx0fSk7XHJcblx0XHRmdW5jX3N0ciA9IGZ1bmNfc3RyLnJlcGxhY2UodGhpcy5vd25lckRvY0RldGVjdFJlZ2V4LCAnLnNfb3duZXJEb2N1bWVudCcpO1xyXG5cdFx0cmV0dXJuIChmdW5jdGlvbih3aW5kb3csIGRvY3VtZW50LCBmdW5jX3N0ciwgYXJncykge1xyXG5cdFx0XHR2YXIgZ2xvYmFsU2NvcGVJbml0ID0gJyc7XHJcblx0XHRcdGZvcih2YXIgeCBpbiB3aW5kb3cpXHJcblx0XHRcdFx0Z2xvYmFsU2NvcGVJbml0ICs9ICd2YXIgJyt4KycgPSB3aW5kb3dbXCInK3grJ1wiXTsnO1xyXG5cdFx0XHRnbG9iYWxTY29wZUluaXQgKz0gJ3ZhciBfX3N1cGVyX18gPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YoT2JqZWN0LmdldFByb3RvdHlwZU9mKHRoaXMpKTsnO1xyXG5cdFx0XHR2YXIgaW5keCA9IGZ1bmNfc3RyLmluZGV4T2YoJ3snKSArMTtcclxuXHRcdFx0Tm9kZS5wcm90b3R5cGUuc19vd25lckRvY3VtZW50ID0gZG9jdW1lbnQ7XHJcblx0XHRcdHJldHVybiBldmFsKCcoJytbZnVuY19zdHIuc2xpY2UoMCwgaW5keCksIGdsb2JhbFNjb3BlSW5pdCwgZnVuY19zdHIuc2xpY2UoaW5keCldLmpvaW4oJycpKycpLmFwcGx5KHRoaXMsYXJncyknKTtcclxuXHRcdH0uYmluZChvYmopKSh0aGlzLmdsb2JhbENvbnRleHRQcm94eSwgdGhpcy5kb21Qcm94eSwgZnVuY19zdHIsIGFyZ3MpO1xyXG5cdH1cclxufVxyXG4iXSwic291cmNlUm9vdCI6IiJ9