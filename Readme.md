### Magnum Loader

A package.json based plugin loading system for the Magnum DI dependency injection framework.

### Install

```shell
$ npm  install magnum-loader --save
```

### Overview

Magnum Loader is a layer ordered, hook based plugin system. Plugins can be automatically loaded from the requireing modules package.json, as well as from a configurable plugin directory.

Plugin hook functions are provided several parameters with which to interact with the loader as well as several context dependent properties bound to "this" inside the hook functions.

Plugin Hooks are run in layer order, each plugin has the ability to add dependencies to the Magnum DI injector, allowing subsequent layers 
access to the dependencies added by previous layers.

A plugin module can return one plugin or several in an array, and each individual plugin can inject a single dependency object, merge with an existing object, inject a factory function, or return an array of the above.


### Usage

```javascript
var dependencies = require('./package.json');
var loader = require('magnum-loader')

var options = {
  prefix: 'myframework', // loads myframework-*
  layers: ['core', 'dependency', 'platform'],
  logger: console
}

loader = loader(dependencies, options)

loader.on('ready', function(){
	// All of your loaded plugins are in the injector.
	loader.load();
});

loader.on('load', function(){
    // Runs the start hook on all of your plugins.
	loader.start()
})

loader.on('start', function(){
	//Start your actual application here.
})

loader.on('stop', function(){
  // the stop hook of all of your plugins have
  // been called.
  process.exit()
})

loader.on('error', function(err){
	// Uh oh, there was a problem.
})

// Listen for Interrupt and attempt to gracefully stop 
// our plugins.
process.on('SIGINT', function() {
    loader.stop();
});
```

### Plugin Specification


 