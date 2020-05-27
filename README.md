# JS-Sandbox
A pure Javascript library for code evalutation in limited and isolated context

## Start to use

First install as dependencies by your package manager
```
npm install js-sandbox
```

Now you import the module `js-sandbox` in your code
```javascript
import Sandbox from 'js-sandbox';
```

Once imported you can instantiate a `Sandbox` objects where to run your code.

## API

### Sandbox
* __constructor__ ( dom, context )
  * _dom_: a DOM element to use as document variable for code executed into the Sandbox.
  * _context_: object to use as windows for code executed into the Sandbox.
* __execCode__ ( code [, newContext ] )
  * _code_: javascript code to execute in the Sandbox.
  * _newContext_: a new object to use as window for code executed into the Sandbox instead of context passed to the constructor.
* __execFunction__ ( func, args [, newContext ] )
  * _func_: function to execute in the Sandbox.
  * _args_: ordered array of arguments for the function.
  * _newContext_: a new object to use as window for code executed into the Sandbox instead of context passed to the constructor.
* __execMethod__ ( method, args, obj )
  * _method_: the name of method to execute.
  * _args_: ordered array of arguments for the method.
  * _obj_: the object to use as this which prototype has method requested otherwise a `SandboxException` will be raise.
