/**
 * @file plugin
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

"use strict";

var tap = require('tap');
var mockery = require('mockery');
var path = require('path');
var Plugin = require(path.join(__dirname, '../../', 'lib/Plugin/Plugin'));
var Errors = require(path.join(__dirname, '../../', 'lib/Errors'));
var injector = require('magnum-di');

mockery.enable({
  useCleanCache: true,
  warnOnUnregistered: false
});

var plugin;

var pluginObj = {
  loaded: {
    defaults: {},
    metadata: {
      name: 'Unit',
      layer: 'core',
      type: 'service',
      inject: 'Test'
    },
    plugin: {load: load, start: isDone, stop: isDone}
  },
  moduleName: 'instantiation-test'
};

var instanceObjects = {
  Logger: console,
  Injector: injector,
  Output: {options: {verbose: true}},
  FrameworkErrors: Errors,
  FrameworkOptions: {
    prefix: 'magnum',
    timeout: 2000,
    layers: ['core'],
    parentDirectory: path.join(__dirname, '../')
  }
};


tap.test('Plugin module instantiates with correct args', function(t) {

  t.plan(3);

  function noThrow(){
    plugin = new Plugin(pluginObj, {}, instanceObjects)
  }
  t.doesNotThrow(noThrow, 'Instantiates');
  t.ok(plugin, 'Plugin exists');
  t.equal(plugin.declaredName, 'Unit', 'Correct values set');
});

tap.test('Plugin load hook', function(t) {
  plugin.load()
    .then(function(result){
      t.equal(result.declaredName, 'Unit', 'Load result Correct declaredName');
      return plugin.load()
        .then(function(){
          t.fail('Should reject additional load calls.')
          return t.end()
        })
        .catch(function(err){
          t.equal(err.name, 'PluginHookError', 'Error has correct type');
          t.equal(err.hook, 'load', 'Error has correct hook value');
          t.pass('Should reject if called again.')
          t.end()
          return null
        })
      return null
    })
});

tap.test('Plugin start hook', function(t) {
  plugin.start()
    .then(function(result){
      t.equal(result.declaredName, 'Unit', 'Start result Correct declaredName');
      return plugin.start()
        .then(function(){
          t.fail('Should reject additional start calls.')
          return t.end()
        })
        .catch(function(err){
          t.equal(err.name, 'PluginHookError', 'Error has correct type');
          t.equal(err.hook, 'start', 'Error has correct hook value');
          t.pass('Should reject if called again.')
          t.end()
          return null
        })
    })
});

tap.test('Plugin stop hook', function(t) {
  plugin.stop()
    .then(function(result){
      t.equal(result.declaredName, 'Unit', 'Stop result Correct declaredName');
      return plugin.stop()
        .then(function(){
          t.fail('Should reject additional start calls.')
          return t.end()
        })
        .catch(function(err){
          t.equal(err.name, 'PluginHookError', 'Error has correct type');
          t.equal(err.hook, 'stop', 'Error has correct hook value');
          t.pass('Should reject if called again.')
          t.end()
          return null
        })
    })
});

function load(injector, loaded){return loaded(null, {ok: true})}
function isDone(done) {
  return done(null)
}