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
var DI = require('magnum-di')
var injector = DI();
var FrameworkInjector = DI()
var Iterator = require('../../lib/PluginIterator');
var Output = require('../../lib/Outputs');
var RawPlugin = require('../../lib/Plugin/RawPluginTypes/Dependency');
var Plugin = require('../../lib/Plugin/Plugin');
var path = require('path');

var OptionValidators = require(path.join(__dirname, '../../', 'lib/Validators/FrameworkOptionValidators'));
var mockSettingsPath = path.join(__dirname, '../mocks/mockPluginSettings')
var instanceObjects = {
  ParentDirectory: path.join(__dirname, '../'),
  Loggers: {
    SystemLogger: mockConsole(),
    FrameworkLogger: mockConsole(),
    Output: Output(false, false)
  },
  FrameworkErrors: require('../../lib/Errors'),
  Injector: injector,
  FrameworkInjector: FrameworkInjector,
  FrameworkOptions: {
    prefix: 'magnum',
    timeout: 2000,
    layers: ['core'],
    pluginSettingsDirectory: OptionValidators.findPluginSettings(mockSettingsPath)
  }
};

FrameworkInjector.service('LoggerBuilder', function(){
  return mockConsole()
})

var Shared = {
  ParentDirectory: instanceObjects.ParentDirectory,
  Logger: instanceObjects.Loggers.Logger,
  Injector: instanceObjects.Injector,
  FrameworkInjector: instanceObjects.FrameworkInjector,
  Output: instanceObjects.Loggers.Output,
  FrameworkErrors: instanceObjects.FrameworkErrors,
  FrameworkOptions: instanceObjects.FrameworkOptions
};

var plugins = [
    makePlugin('test-a'),
    makePlugin('test-b'),
    makePlugin('test-c')
  ]

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
        return null
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
      return null
    })

});

tap.test('Iterator stop method', function(t) {

  iteratorInst.stop()
    .then(function(result) {
      t.ok(result.Core, 'Should have core object.');

      result.Core.forEach(function(plugin){
        console.log(plugin.stopped);
        t.ok(plugin.stopped, plugin.declaredName + ' stopped.');
      })
      t.end()
      return null
    })

});

tap.test('Iterator build plugin configs', function(t) {
  t.plan(2)
  var defaults = iteratorInst.getPluginConfigs({stringify: false, defaults: true});
  var computed = iteratorInst.getPluginConfigs({stringify: false, defaults: false});
  t.ok(defaults)
  t.ok(computed)
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
          options: {name: moduleName},
          metadata: {name: moduleName, layer: 'core', type: 'service', param: moduleName.replace('-', '_')},
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
  var plugin = new RawPlugin(pArgs, instanceObjects.FrameworkOptions.layers)
  return new Plugin(plugin, Shared)
}

function mockConsole(){
  return {
    log: function(){},
    error: function(){},
    info: function(){},
    warn: function(){},
  }
}