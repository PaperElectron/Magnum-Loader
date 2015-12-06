### Magnum Loader

A package.json based plugin loading system for the Magnum DI dependency injection framework.

### Install

```shell
$ npm  install magnum-loader --save
```

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