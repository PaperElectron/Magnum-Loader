/**
 * @file iterator
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

"use strict";

var tap = require('tap');
var mockery = require('mockery');
mockery.enable({
  useCleanCache: true,
  warnOnUnregistered: false
});
var injector = require('magnum-di');
var Iterator = require('../../lib/PluginIterator');
var Output = require('../../lib/Outputs');
var Plugin = require('../../lib/Plugin');
var path = require('path');

var instanceObjects = {
  ParentDirectory: path.join(__dirname, '../'),
  Loggers: {
    SystemLogger: mockConsole(),
    FrameworkLogger: mockConsole(),
    Output: Output(false, false)
  },
  FrameworkErrors: require('../../lib/Errors'),
  Injector: injector,
  FrameworkOptions: {
    timeout: 2000,
    layers: ['core']
  }
};

var Shared = {
  ParentDirectory: instanceObjects.ParentDirectory,
  Logger: instanceObjects.Loggers.Logger,
  Injector: instanceObjects.Injector,
  Output: instanceObjects.Loggers.Output,
  FrameworkErrors: instanceObjects.FrameworkErrors,
  FrameworkOptions: instanceObjects.FrameworkOptions
};

var plugins = {
  core: [
    makePlugin('test-a'),
    makePlugin('test-b'),
    makePlugin('test-c')
  ]
};

var iteratorInst;

tap.test('Iterator instantiation', function(t) {
  t.plan(1);
  iteratorInst = new Iterator(plugins, instanceObjects.FrameworkOptions.layers, instanceObjects);
  t.equal(iteratorInst instanceof Iterator, true, "Should create an Iterator instance.");
});



tap.test('Iterator load method', function(t) {

  iteratorInst.load()
      .then(function(result) {
        t.ok(result.Core, 'Should have core object.');

        result.Core.forEach(function(plugin){
          t.ok(plugin.loaded, plugin.declaredName + ' loaded.');
        })
        t.end()
      })

});

tap.test('Iterator start method', function(t) {

  iteratorInst.start()
    .then(function(result) {
      t.ok(result.Core, 'Should have core object.');

      result.Core.forEach(function(plugin){
        t.ok(plugin.started, plugin.declaredName + ' started.');
      })
      t.end()
    })

});

tap.test('Iterator stop method', function(t) {

  iteratorInst.stop()
    .then(function(result) {
      t.ok(result.Core, 'Should have core object.');

      result.Core.forEach(function(plugin){
        t.ok(plugin.stopped, plugin.declaredName + ' stopped.');
      })
      t.end()
    })

});

tap.test('Find conflicts', function(t){
  t.plan(1)
  var conflicts = iteratorInst.findNameConflict('none')
  t.equal(conflicts.conflicts.length, 0, 'No conflicts')
})



function makePlugin(moduleName) {
  var pArgs =
      {
        loaded: {
          metadata: {name: moduleName, layer: 'core', type: 'service', inject: moduleName.replace('-', '_')},
          plugin: {
            load: function(inject, loaded) {
              loaded(null, {name: moduleName})
            },
            start: function(done) {
              done()
            },
            stop: function(done) {
              done()
            }
          }
        },
        moduleName: moduleName
      };

  return new Plugin(pArgs, {}, Shared)
}

function mockConsole(){
  return {
    log: function(){},
    error: function(){},
    info: function(){},
    warn: function(){},
  }
}