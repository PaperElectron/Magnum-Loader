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
  prefix: 'pomegranate',
  layers: ['core', 'data', 'dependency', 'platform'],
  logger: console,
  verbose: false,
  parentDirectory: __dirname,
  pluginDirectory: path.join(__dirname, '/test/plugins'),
}

mockery.enable()
mockery.warnOnUnregistered(false);

mockery.registerSubstitute('pomegranate-test-a', './test/mocks/plugins/pomegranate-test-a');
mockery.registerSubstitute('pomegranate-test-b', './test/mocks/plugins/pomegranate-test-b');
mockery.registerSubstitute('pomegranate-test-c', './test/mocks/plugins/pomegranate-test-c');
mockery.registerSubstitute('pomegranate-test-d', './test/mocks/plugins/pomegranate-test-d');
mockery.registerSubstitute('pomegranate-test-e', './test/mocks/plugins/pomegranate-test-e');
mockery.registerSubstitute('pomegranate-test-f', './test/mocks/plugins/pomegranate-test-f');

var loader = require('./index')({
  "dependencies": {
    "pomegranate-test-a": "0.0.0",
    "pomegranate-test-b": "0.0.0",
    "pomegranate-test-c": "0.0.0",
    "pomegranate-test-d": "0.0.0",
    "pomegranate-test-e": "0.0.0",
    "pomegranate-test-f": "0.0.0"
  }}, options, pluginOptions)

loader.on('ready', function(){
  loader.load()
})

loader.on('load', function(){
  console.log('loaded');
})

loader.on('error', function(err){
  console.log(err.stack);
})

process.on('uncaughtException', function(err) {
  console.log(err.stack);
})