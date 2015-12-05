/**
 * @file temp
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */
var injector = require('magnum-di');
var loader = require('./MagnumLoader')(injector, {
  "dependencies": {
    "pomegranate-test-a": "0.0.0",
    "pomegranate-test-b": "0.0.0",
    "pomegranate-test-c": "0.0.0",
    "pomegranate-test-d": "0.0.0",
    "pomegranate-test-e": "0.0.0"
  }})

loader.on('ready', function() {
  console.log('ready');
  loader.load()
});

loader.on('load', function(){
  console.log('loaded');
  loader.start();
});

loader.on('start', function(){
  console.log('started');
  loader.unload()
});

loader.on('unload', function() {
  console.log('unloaded');
  loader.stop()
});

loader.on('stop', function(){
  console.log('stopped');
});