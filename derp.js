/**
 * @file derp
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

var should = require('should');
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
    host: 'localhost',
    port: 3006
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
  loader.load()
})

loader.on('load', function(){
  loader.start()
})

loader.on('error', function(err){
  process.exit();
})

process.on('uncaughtException', function(err) {
  console.log(err.stack);
})