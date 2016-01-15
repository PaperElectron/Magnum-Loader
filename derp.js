/**
 * @file derp
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */


var mockery = require('mockery');
var _ = require('lodash');
var path = require('path');

var mockConsole = {
  log: _.noop,
  warn:_.noop,
  error: _.noop,
  info: _.noop
}

var pluginOptions = {
  test_a: {
    name: 'localhost',
    value: 3006
  }
}
var options = {
  prefix: 'isolate',
  layers: ['core', 'data', 'dependency', 'platform'],
  logger: console,
  verbose: true,
  colors: true,
  parentDirectory: __dirname + '/test/'
}

mockery.enable()
mockery.warnOnUnregistered(false);

mockery.registerSubstitute('isolate-test-a', './test/mocks/plugins/isolate-test-a');
mockery.registerSubstitute('isolate-test-b', './test/mocks/plugins/isolate-test-b');

var loader = require('./index')({
  "dependencies": {
    "isolate-test-a": "0.0.0",
    "isolate-test-b": "0.0.0"
  }}, options, pluginOptions)


loader.on('ready', function(){
  console.log(loader.getDefaultConfigs({stringify: true, returnDefaults: false}))
  setTimeout(function() {
    loader.load()
  }, 1000);
})

loader.on('load', function(){
  loader.start()
})

loader.on('start', function(){
  setTimeout(function(){
    loader.stop()
  }, 1000 * 60)
})

loader.on('stop', function(){
})

loader.on('error', function(err){
  process.exit();
})

process.on('uncaughtException', function(err) {
  console.log(err.stack);
})