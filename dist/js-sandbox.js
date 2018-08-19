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
/* harmony import */ var _SandboxException_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./SandboxException.js */ "./src/SandboxException.js");


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
		return (function(window, document, code) {
			var globalScopeInit = '';
			for(var x in window)
				globalScopeInit += 'var '+x+' = window["'+x+'"];';
			Node.prototype.s_ownerDocument = document;
			return eval(globalScopeInit+code);
		}.bind(newcontext))(this.globalContextProxy, this.domProxy, code);
	}
	execFunction(func, args, newcontext = this.globalContext){
		if(!(func instanceof Function) && !(typeof func == 'function')) throw new _SandboxException_js__WEBPACK_IMPORTED_MODULE_0__["default"]("Object passed is not a function");
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
		if(!(obj[meth] instanceof Function) && !(typeof obj[meth] == 'function')) throw new _SandboxException_js__WEBPACK_IMPORTED_MODULE_0__["default"](meth + " is not a method");
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

/***/ }),

/***/ "./src/SandboxException.js":
/*!*********************************!*\
  !*** ./src/SandboxException.js ***!
  \*********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return SandboxException; });
class SandboxException{
	constructor(message){
		this.message = message;
	}
}

/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL1NhbmRib3guanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL1NhbmRib3hFeGNlcHRpb24uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esa0RBQTBDLGdDQUFnQztBQUMxRTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGdFQUF3RCxrQkFBa0I7QUFDMUU7QUFDQSx5REFBaUQsY0FBYztBQUMvRDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaURBQXlDLGlDQUFpQztBQUMxRSx3SEFBZ0gsbUJBQW1CLEVBQUU7QUFDckk7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7O0FBR0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7OztBQ2xGQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLHVCQUF1QjtBQUMxQztBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsdUJBQXVCO0FBQzFDO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQix1QkFBdUI7QUFDMUM7QUFDQSxNQUFNO0FBQ047QUFDQSxJQUFJO0FBQ0osR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9EQUFvRDtBQUNwRDtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9EQUFvRDtBQUNwRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9EQUFvRDtBQUNwRCwwRkFBMEY7QUFDMUYsaUNBQWlDO0FBQ2pDO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQSxDOzs7Ozs7Ozs7Ozs7OztBQ3BIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEMiLCJmaWxlIjoianMtc2FuZGJveC5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGdldHRlciB9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcbiBcdFx0fVxuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4gXHQvLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbiBcdC8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuIFx0Ly8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4gXHQvLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuIFx0XHRpZihtb2RlICYgMSkgdmFsdWUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKHZhbHVlKTtcbiBcdFx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcbiBcdFx0aWYoKG1vZGUgJiA0KSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcbiBcdFx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG5zLCAnZGVmYXVsdCcsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHZhbHVlIH0pO1xuIFx0XHRpZihtb2RlICYgMiAmJiB0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIGZvcih2YXIga2V5IGluIHZhbHVlKSBfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGtleSwgZnVuY3Rpb24oa2V5KSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LmJpbmQobnVsbCwga2V5KSk7XG4gXHRcdHJldHVybiBucztcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vc3JjL1NhbmRib3guanNcIik7XG4iLCJpbXBvcnQgU2FuZGJveEV4Y2VwdGlvbiBmcm9tICcuL1NhbmRib3hFeGNlcHRpb24uanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2FuZGJveHtcclxuXHRjb25zdHJ1Y3Rvcihkb21TdGFydE5vZGUgPSBudWxsLCBzdGFydGluZ0dsb2JhbCA9IG51bGwpe1xyXG5cdFx0dGhpcy5nbG9iYWxDb250ZXh0ID0gc3RhcnRpbmdHbG9iYWwgfHwge307XHJcblx0XHR0aGlzLmRvbSA9IGRvbVN0YXJ0Tm9kZSB8fCBkb2N1bWVudDtcclxuXHRcdHRoaXMuc3VwZXJEZXRlY3RSZWdleCA9IC9zdXBlclxcLihbXihdKykoXFwoPykvZ207XHJcblx0XHR0aGlzLm93bmVyRG9jRGV0ZWN0UmVnZXggPSAvLm93bmVyRG9jdW1lbnQvZ207XHJcblx0XHR0aGlzLmRvbVByb3h5ID0gbmV3IFByb3h5KHRoaXMuZG9tLCB7XHJcblx0XHRcdGdldDogZnVuY3Rpb24odGFyZ2V0LCBuYW1lKSB7XHJcblx0XHRcdFx0aWYobmFtZSA9PSAnYm9keScpIHJldHVybiB0YXJnZXQ7XHJcblx0XHRcdFx0aWYobmFtZSA9PSAncm9vdE5vZGUnKSByZXR1cm4gdGFyZ2V0O1xyXG5cdFx0XHRcdHZhciByZXQ7XHJcblx0XHRcdFx0Ly9Eb2N1bWVudCBub2RlIGVtdWxhdGVcclxuXHRcdFx0XHRpZihuYW1lID09ICdub2RlTmFtZScgfHxcclxuXHRcdFx0XHRcdG5hbWUgPT0gJ25vZGVUeXBlJyB8fFxyXG5cdFx0XHRcdFx0bmFtZSA9PSAnb3duZXJEb2N1bWVudCcgfHxcclxuXHRcdFx0XHRcdG5hbWUgPT0gJ3BhcmVudEVsZW1lbnQnIHx8XHJcblx0XHRcdFx0XHRuYW1lID09ICdwYXJlbnROb2RlJ1xyXG5cdFx0XHRcdClcclxuXHRcdFx0XHRcdHJldCA9IGRvY3VtZW50W25hbWVdO1xyXG5cdFx0XHRcdGVsc2VcclxuXHRcdFx0XHRcdHJldCA9IG5hbWUgaW4gdGFyZ2V0ID9cclxuXHRcdFx0XHRcdFx0dGFyZ2V0W25hbWVdIDpcclxuXHRcdFx0XHRcdFx0ZG9jdW1lbnRbbmFtZV07XHJcblx0XHRcdFx0aWYoICEobmFtZSBpbiB0YXJnZXQpICYmIChyZXQgaW5zdGFuY2VvZiBGdW5jdGlvbikpXHJcblx0XHRcdFx0XHRyZXQgPSBmdW5jdGlvbihyZWFsRnVuYyl7XHJcblx0XHRcdFx0XHRcdHZhciBhcmdzID0gW107XHJcblx0XHRcdFx0XHRcdGZvciAodmFyIGk9MDsoaSsxKTxhcmd1bWVudHMubGVuZ3RoO2krKykgYXJnc1tpXT1hcmd1bWVudHNbaSsxXTtcclxuXHRcdFx0XHRcdFx0cmV0dXJuIHJlYWxGdW5jLmFwcGx5KHRoaXMsIGFyZ3MpO1xyXG5cdFx0XHRcdFx0fS5iaW5kKGRvY3VtZW50LCByZXQpO1xyXG5cdFx0XHRcdGVsc2UgaWYocmV0IGluc3RhbmNlb2YgRnVuY3Rpb24pe1xyXG5cdFx0XHRcdFx0dmFyIHN0ZXAycmV0ID0gZnVuY3Rpb24ocmVhbEZ1bmMpe1xyXG5cdFx0XHRcdFx0XHR2YXIgYXJncyA9IFtdO1xyXG5cdFx0XHRcdFx0XHRmb3IgKHZhciBpPTA7KGkrMSk8YXJndW1lbnRzLmxlbmd0aDtpKyspIGFyZ3NbaV09YXJndW1lbnRzW2krMV07XHJcblx0XHRcdFx0XHRcdHJldHVybiByZWFsRnVuYy5hcHBseSh0aGlzLCBhcmdzKTtcclxuXHRcdFx0XHRcdH0uYmluZCh0YXJnZXQsIHJldCk7XHJcblx0XHRcdFx0XHRpZihuYW1lID09ICdnZXRFbGVtZW50c0J5VGFnTmFtZScpXHJcblx0XHRcdFx0XHRcdHJldCA9IGZ1bmN0aW9uKHN0ZXAyLCBodG1sVGFnKXtcclxuXHRcdFx0XHRcdFx0XHRpZihodG1sVGFnID09ICdib2R5JylcclxuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBbdGhpc107XHJcblx0XHRcdFx0XHRcdFx0ZWxzZVxyXG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHN0ZXAyLmNhbGwodGhpcywgaHRtbFRhZyk7XHJcblx0XHRcdFx0XHRcdH0uYmluZCh0YXJnZXQsIHN0ZXAycmV0KTtcclxuXHRcdFx0XHRcdGVsc2VcclxuXHRcdFx0XHRcdFx0cmV0ID0gc3RlcDJyZXQ7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdHJldHVybiByZXQ7XHJcblx0XHRcdH0uYmluZChkb2N1bWVudCksXHJcblx0XHRcdHNldDogZnVuY3Rpb24odGFyZ2V0LCBwcm9wZXJ0eSwgdmFsdWUpe1xyXG5cdFx0XHRcdHZhciBmID0gZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRcdHRoaXNbcHJvcGVydHldID0gdmFsdWU7XHJcblx0XHRcdFx0fS5iaW5kKHRhcmdldCk7XHJcblx0XHRcdFx0ZigpO1xyXG5cdFx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHRcdHRoaXMuZ2xvYmFsQ29udGV4dFByb3h5ID0gbmV3IFByb3h5KHRoaXMuZ2xvYmFsQ29udGV4dCwge1xyXG5cdFx0XHRnZXQ6IGZ1bmN0aW9uKHNhbmRib3gsIHRhcmdldCwgbmFtZSkge1xyXG5cdFx0XHRcdGlmKG5hbWUgPT0gJ2RvY3VtZW50JykgcmV0dXJuIHNhbmRib3guZG9tUHJveHk7XHJcblx0XHRcdFx0dmFyIHJldCA9IG5hbWUgaW4gdGFyZ2V0ID9cclxuXHRcdFx0XHR0YXJnZXRbbmFtZV0gOlxyXG5cdFx0XHRcdFx0d2luZG93W25hbWVdO1xyXG5cdFx0XHRcdGlmKCAhKG5hbWUgaW4gdGFyZ2V0KSAmJiAocmV0IGluc3RhbmNlb2YgRnVuY3Rpb24pKVxyXG5cdFx0XHRcdFx0cmV0ID0gZnVuY3Rpb24ocmVhbEZ1bmMpe1xyXG5cdFx0XHRcdFx0XHR2YXIgYXJncyA9IFtdO1xyXG5cdFx0XHRcdFx0XHRmb3IgKHZhciBpPTA7KGkrMSk8YXJndW1lbnRzLmxlbmd0aDtpKyspIGFyZ3NbaV09YXJndW1lbnRzW2krMV07XHJcblx0XHRcdFx0XHRcdHJldHVybiByZWFsRnVuYy5hcHBseSh0aGlzLCBhcmdzKTtcclxuXHRcdFx0XHRcdH0uYmluZCh3aW5kb3csIHJldCk7XHJcblx0XHRcdFx0cmV0dXJuIHJldDtcclxuXHRcdFx0fS5iaW5kKHdpbmRvdywgdGhpcylcclxuXHRcdH0pO1xyXG5cdH1cclxuXHRleGVjQ29kZShjb2RlLCBuZXdjb250ZXh0ID0gdGhpcy5nbG9iYWxDb250ZXh0KXtcclxuXHRcdGNvZGUgPSBjb2RlLnJlcGxhY2UodGhpcy5vd25lckRvY0RldGVjdFJlZ2V4LCAnLnNfb3duZXJEb2N1bWVudCcpO1xyXG5cdFx0cmV0dXJuIChmdW5jdGlvbih3aW5kb3csIGRvY3VtZW50LCBjb2RlKSB7XHJcblx0XHRcdHZhciBnbG9iYWxTY29wZUluaXQgPSAnJztcclxuXHRcdFx0Zm9yKHZhciB4IGluIHdpbmRvdylcclxuXHRcdFx0XHRnbG9iYWxTY29wZUluaXQgKz0gJ3ZhciAnK3grJyA9IHdpbmRvd1tcIicreCsnXCJdOyc7XHJcblx0XHRcdE5vZGUucHJvdG90eXBlLnNfb3duZXJEb2N1bWVudCA9IGRvY3VtZW50O1xyXG5cdFx0XHRyZXR1cm4gZXZhbChnbG9iYWxTY29wZUluaXQrY29kZSk7XHJcblx0XHR9LmJpbmQobmV3Y29udGV4dCkpKHRoaXMuZ2xvYmFsQ29udGV4dFByb3h5LCB0aGlzLmRvbVByb3h5LCBjb2RlKTtcclxuXHR9XHJcblx0ZXhlY0Z1bmN0aW9uKGZ1bmMsIGFyZ3MsIG5ld2NvbnRleHQgPSB0aGlzLmdsb2JhbENvbnRleHQpe1xyXG5cdFx0aWYoIShmdW5jIGluc3RhbmNlb2YgRnVuY3Rpb24pICYmICEodHlwZW9mIGZ1bmMgPT0gJ2Z1bmN0aW9uJykpIHRocm93IG5ldyBTYW5kYm94RXhjZXB0aW9uKFwiT2JqZWN0IHBhc3NlZCBpcyBub3QgYSBmdW5jdGlvblwiKTtcclxuXHRcdHJldHVybiAoZnVuY3Rpb24od2luZG93LCBkb2N1bWVudCwgb3dEb2NSZWdFeCwgZnVuYywgYXJncykge1xyXG5cdFx0XHR2YXIgZ2xvYmFsU2NvcGVJbml0ID0gJyc7XHJcblx0XHRcdGZvcih2YXIgeCBpbiB3aW5kb3cpXHJcblx0XHRcdFx0Z2xvYmFsU2NvcGVJbml0ICs9ICd2YXIgJyt4KycgPSB3aW5kb3dbXCInK3grJ1wiXTsnO1xyXG5cdFx0XHR2YXIgZnVuY19zdHIgPSBmdW5jLnRvU3RyaW5nKCk7XHJcblx0XHRcdGlmKCFmdW5jX3N0ci5zdGFydHNXaXRoKCdmdW5jdGlvbicpKVxyXG5cdFx0XHRcdGZ1bmNfc3RyID0gJ2Z1bmN0aW9uICcgKyBmdW5jX3N0cjtcclxuXHRcdFx0Tm9kZS5wcm90b3R5cGUuc19vd25lckRvY3VtZW50ID0gZG9jdW1lbnQ7XHJcblx0XHRcdGZ1bmNfc3RyID0gZnVuY19zdHIucmVwbGFjZShvd0RvY1JlZ0V4LCAnLnNfb3duZXJEb2N1bWVudCcpO1xyXG5cdFx0XHRyZXR1cm4gZXZhbChnbG9iYWxTY29wZUluaXQrJygnK2Z1bmNfc3RyKycuYmluZCh0aGlzKSkuYXBwbHkodGhpcyxhcmdzKScpO1xyXG5cdFx0fS5iaW5kKG5ld2NvbnRleHQpKSh0aGlzLmdsb2JhbENvbnRleHRQcm94eSwgdGhpcy5kb21Qcm94eSwgdGhpcy5vd25lckRvY0RldGVjdFJlZ2V4LCBmdW5jLCBhcmdzKTtcclxuXHR9XHJcblx0ZXhlY01ldGhvZChtZXRoLCBhcmdzLCBvYmope1xyXG5cdFx0aWYoIShvYmpbbWV0aF0gaW5zdGFuY2VvZiBGdW5jdGlvbikgJiYgISh0eXBlb2Ygb2JqW21ldGhdID09ICdmdW5jdGlvbicpKSB0aHJvdyBuZXcgU2FuZGJveEV4Y2VwdGlvbihtZXRoICsgXCIgaXMgbm90IGEgbWV0aG9kXCIpO1xyXG5cdFx0dmFyIGZ1bmNfc3RyID0gb2JqW21ldGhdLnRvU3RyaW5nKCk7XHJcblx0XHRpZighZnVuY19zdHIuc3RhcnRzV2l0aCgnZnVuY3Rpb24nKSlcclxuXHRcdFx0ZnVuY19zdHIgPSAnZnVuY3Rpb24gJyArIGZ1bmNfc3RyO1xyXG5cdFx0ZnVuY19zdHIgPSBmdW5jX3N0ci5yZXBsYWNlKHRoaXMuc3VwZXJEZXRlY3RSZWdleCwgZnVuY3Rpb24obWF0Y2gsIHAxLCBwMil7XHJcblx0XHRcdHJldHVybiAnX19zdXBlcl9fLicrcDErJy5iaW5kKHRoaXMpJytwMjtcclxuXHRcdH0pO1xyXG5cdFx0ZnVuY19zdHIgPSBmdW5jX3N0ci5yZXBsYWNlKHRoaXMub3duZXJEb2NEZXRlY3RSZWdleCwgJy5zX293bmVyRG9jdW1lbnQnKTtcclxuXHRcdHJldHVybiAoZnVuY3Rpb24od2luZG93LCBkb2N1bWVudCwgZnVuY19zdHIsIGFyZ3MpIHtcclxuXHRcdFx0dmFyIGdsb2JhbFNjb3BlSW5pdCA9ICcnO1xyXG5cdFx0XHRmb3IodmFyIHggaW4gd2luZG93KVxyXG5cdFx0XHRcdGdsb2JhbFNjb3BlSW5pdCArPSAndmFyICcreCsnID0gd2luZG93W1wiJyt4KydcIl07JztcclxuXHRcdFx0Z2xvYmFsU2NvcGVJbml0ICs9ICd2YXIgX19zdXBlcl9fID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKE9iamVjdC5nZXRQcm90b3R5cGVPZih0aGlzKSk7JztcclxuXHRcdFx0dmFyIGluZHggPSBmdW5jX3N0ci5pbmRleE9mKCd7JykgKzE7XHJcblx0XHRcdE5vZGUucHJvdG90eXBlLnNfb3duZXJEb2N1bWVudCA9IGRvY3VtZW50O1xyXG5cdFx0XHRyZXR1cm4gZXZhbCgnKCcrW2Z1bmNfc3RyLnNsaWNlKDAsIGluZHgpLCBnbG9iYWxTY29wZUluaXQsIGZ1bmNfc3RyLnNsaWNlKGluZHgpXS5qb2luKCcnKSsnKS5hcHBseSh0aGlzLGFyZ3MpJyk7XHJcblx0XHR9LmJpbmQob2JqKSkodGhpcy5nbG9iYWxDb250ZXh0UHJveHksIHRoaXMuZG9tUHJveHksIGZ1bmNfc3RyLCBhcmdzKTtcclxuXHR9XHJcbn0iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBTYW5kYm94RXhjZXB0aW9ue1xyXG5cdGNvbnN0cnVjdG9yKG1lc3NhZ2Upe1xyXG5cdFx0dGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcclxuXHR9XHJcbn0iXSwic291cmNlUm9vdCI6IiJ9