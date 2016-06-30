/**
 * @file iterator
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

"use strict";

var tap = require('tap');
var mockery = require('mockery');
var path = require('path');
mockery.enable({
  useCleanCache: true,
  warnOnUnregistered: false
});
var DI = require('magnum-di');
var injector = DI();
var FrameworkInjector = DI();
var NameGenerator = require(path.join(__dirname, '../../', 'lib/Validators/NameGenerator'))()
var Iterator = require('../../lib/PluginIterator');
var Output = require('../../lib/Outputs');
var RawPlugin = require('../../lib/RawPlugin/Types/Dependency');
var Plugin = require('../../lib/Plugin/Plugin');


var OptionValidators = require(path.join(__dirname, '../../', 'lib/Validators/FrameworkOptionValidators'));
var mockSettingsPath = path.join(__dirname, '../mocks/mockPluginSettings');
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

FrameworkInjector.service('Options', instanceObjects.FrameworkOptions)

FrameworkInjector.service('LoggerBuilder', function(){
  return mockConsole()
})

FrameworkInjector.service('NameGenerator', NameGenerator)

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
    makePlugin('test-a', ['TestC']),
    makePlugin('test-b'),
    makePlugin('test-c')
  ]
instanceObjects.loadedModuleNames = ['TestA','TestB','TestC']
FrameworkInjector.service('LoadedModuleNames', instanceObjects.loadedModuleNames)
var iteratorInst;

tap.test('Iterator instantiation', function(t) {
  t.plan(1);
  try {
    iteratorInst = new Iterator(plugins, instanceObjects);
  }
  catch(e){
    console.log(e.stack);
  }
  t.equal(iteratorInst instanceof Iterator, true, "Should create an Iterator instance.");
});



tap.test('Iterator load method', function(t) {
  t.plan(1)
  iteratorInst.load()
      .then(function(result) {
        return t.equal(result.length, 3,  'Loads the correct # of plugins')
      })

});

tap.test('Iterator start method', function(t) {
  t.plan(1)
  iteratorInst.start()
    .then(function(result) {
      return t.equal(result.length, 3,  'Starts the correct # of plugins')
    })

});

tap.test('Iterator stop method', function(t) {
  t.plan(1)
  iteratorInst.stop()
    .then(function(result) {
      return t.equal(result.length, 3,  'Stops the correct # of plugins')
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



function makePlugin(moduleName, depends, provides) {
  var pArgs =
      {
        loaded: {
          options: {name: moduleName},
          metadata: {
            name: moduleName,
            layer: 'core',
            type: 'service',
            depends: depends || [],
            provides: provides || [],
            param: moduleName.replace('-', '_')},
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
  var plugin = new RawPlugin(pArgs)
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
