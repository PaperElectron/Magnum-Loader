/**
 * @file topoSorted
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
var NameGenerator = require(path.join(__dirname, '../../', 'lib/Validators/NameGenerator'))
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
FrameworkInjector.service('LoadedModuleNames', ['TestC','TestD','TestE','TestF','TestG','TestA','TestB'])
FrameworkInjector.service('LoggerBuilder', function(){
  return mockConsole()
})

FrameworkInjector.service('NameGenerator', NameGenerator('magnum'))

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
  makePlugin('test-a', ['TestC', 'TestG']),
  makePlugin('test-b', ['TestF']),
  makePlugin('test-c'),
  makePlugin('test-d'),
  makePlugin('test-e'),
  makePlugin('test-f'),
  makePlugin('test-g')
]
var expectedOrder = FrameworkInjector.get('LoadedModuleNames')
instanceObjects.loadedModuleNames = expectedOrder


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



tap.test('Iterator load method, correct order', function(t) {

  iteratorInst.load()
    .then(function(result) {
      result.forEach(function(plugin, k){
        t.same(plugin.configName, expectedOrder[k], plugin.configName + ' - Should match expected order ' + expectedOrder[k])
        t.ok(plugin.loaded, plugin.declaredName + ' loaded.');
      })
      t.end()
      return null
    })
    // .catch(function(err) {
    //   console.log(iteratorInst);
    // })

});

tap.test('Iterator start method, correct order', function(t) {
  iteratorInst.start()
    .then(function(result) {
      result.forEach(function(plugin, k){
        t.same(plugin.configName, expectedOrder[k], plugin.configName + ' - Should match expected order ' + expectedOrder[k])
        t.ok(plugin.started, plugin.declaredName + ' started.');
      })
      t.end()
      return null
    })

});

tap.test('Iterator stop method, correct order', function(t) {

  iteratorInst.stop()
    .then(function(result) {
      var reverseExpected = expectedOrder.reverse()
      result.forEach(function(plugin, k){

        t.same(plugin.configName, reverseExpected[k], plugin.configName + ' - Should match expected order ' + reverseExpected[k])
        // t.ok(plugin.stopped, plugin.declaredName + ' stopped.');
      })
      t.end()
      return null
    })

});




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
  var plugin = new RawPlugin(pArgs, instanceObjects.FrameworkOptions.layers)
  return new Plugin(plugin, Shared)
}

function mockConsole(){
  // return console
  return {
    log: function(){},
    error: function(){},
    info: function(){},
    warn: function(){},
  }
}