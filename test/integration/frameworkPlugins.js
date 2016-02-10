/**
 * @file frameworkPlugins
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

process.env.PORT = 8081;
var loaderOptions = {
  prefix: 'magnum',
  layers: ['core', 'data', 'dependency', 'platform'],
  logger: cConsole,
  colors: false,
  parentDirectory: path.join(__dirname, '../mocks'),
  pluginDirectory: path.join(__dirname, '../', '/mocks/frameworkPlugins'),
  pluginSettingsDirectory: path.join(__dirname, '../mocks/mockPluginSettings_env')
};

var pkgJson = {
  "dependencies": {
  }
};

mockery.enable({
  useCleanCache: true,
  warnOnUnregistered: false
});

var LoadIndex = require('../../index');
var Loader = LoadIndex(pkgJson, loaderOptions);

tap.test('Injected Options', function(t) {
  t.plan(2);
  Loader.on('ready', function(){
    //toTest = makeTest(t, 'magnum: hookThrows Encountered error while loading. ** this_throws is not defined');
    Loader.load();

  });
  Loader.on('load', function(){
    var testEnv = Loader.getPlugin('TestEnv');
    t.ok(testEnv, 'Plugin loaded');
    t.equal(testEnv.optPort, '8081', 'Plugin set from external file, using Environment dependency');
  })
});

