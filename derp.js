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
  error: _.noop
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
  logger: mockConsole,
  pluginDirectory: path.join(__dirname, '/test/plugins'),
  pluginOptions: pluginOptions
}

mockery.enable()
mockery.warnOnUnregistered(false);

mockery.registerSubstitute('pomegranate-test-a', './test/mocks/pomegranate-test-a');
mockery.registerSubstitute('pomegranate-test-b', './test/mocks/pomegranate-test-b');
mockery.registerSubstitute('pomegranate-test-c', './test/mocks/pomegranate-test-c');
mockery.registerSubstitute('pomegranate-test-d', './test/mocks/pomegranate-test-d');
mockery.registerSubstitute('pomegranate-test-e', './test/mocks/pomegranate-test-e');
mockery.registerSubstitute('pomegranate-test-f', './test/mocks/pomegranate-test-f');

var loader = require('./index')({
  "dependencies": {
    "pomegranate-test-a": "0.0.0",
    "pomegranate-test-b": "0.0.0",
    "pomegranate-test-c": "0.0.0",
    "pomegranate-test-d": "0.0.0",
    "pomegranate-test-e": "0.0.0",
    "pomegranate-test-f": "0.0.0"
  }}, options)

loader.on('ready', function(){
  console.log('done');
  loader.load()
})