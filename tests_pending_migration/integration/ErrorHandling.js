/**
 * @file ErrorHandling
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';

var tap = require('tap');
var mockery = require('mockery');
var _ = require('lodash');
var path = require('path');
var cConsole = {
  log: function(){

  },
  warn: function(){

  },
  error: function(){
    testConsole(arguments)
  },
  info: function(){

  }
};

var toTest;

function testConsole(args){
  return _.isFunction(toTest) && toTest(args[0])
}
function makeTest(t, expect){
  return function(value){
    t.equal(value, expect, 'expected: ' + expect);
    toTest = null;
  }
}

var pluginOptions = {

};
var loaderOptions = {
  prefix: 'magnum',
  layers: ['core', 'data', 'dependency', 'platform'],
  logger: cConsole,
  colors: false,
  parentDirectory: path.join(__dirname, '../mocks'),
  pluginDirectory: path.join(__dirname, '../', '/mocks/errorPlugins'),
  pluginSettingsDirectory: path.join(__dirname, '../mocks/mockPluginSettings')
};

var pkgJson = {
  "dependencies": {
  }
};

mockery.enable({
  useCleanCache: true,
  warnOnUnregistered: false
});

mockery.registerSubstitute('magnum-test-a', '../mocks/externalPlugins/magnum-test-a');
mockery.registerSubstitute('magnum-test-b', '../mocks/externalPlugins/magnum-test-b');
mockery.registerSubstitute('magnum-test-c', '../mocks/externalPlugins/magnum-test-c');
mockery.registerSubstitute('magnum-test-d', '../mocks/externalPlugins/magnum-test-d');
mockery.registerSubstitute('magnum-test-e', '../mocks/externalPlugins/magnum-test-e');
mockery.registerSubstitute('magnum-test-f', '../mocks/externalPlugins/magnum-test-f');
mockery.registerSubstitute('magnum-test-g', '../mocks/externalPlugins/magnum-test-g');

var LoadIndex = require('../../index');
var Loader = LoadIndex(pkgJson, loaderOptions, pluginOptions);

tap.test('Load event', function(t) {
  t.plan(2);
  Loader.on('ready', function(){
    toTest = makeTest(t, 'HookThrows: Encountered an error while loading. *** ReferenceError: this_throws is not defined');
    Loader.load();
  });
  Loader.on('error', function(err){
    t.ok(err, "Error emitted")
  })
});