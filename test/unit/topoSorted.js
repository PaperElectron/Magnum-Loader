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

let TestBuilder = require('../TestBuilder')
let CurrentTest = new TestBuilder()

var PluginInjector = CurrentTest.getPluginDI()// DI();
var FrameworkInjector = CurrentTest.getFrameworkDI();

var NameGenerator = require(path.join(__dirname, '../../', 'lib/Validation/NameGenerator'))
var PrefixSelector = require(path.join(__dirname, '../../','lib/Validation/PrefixSelector'))
var Iterator = require('../../lib/PluginIterator');

var mockSettingsPath = path.join(__dirname, '../mocks/mockPluginSettings');


var instanceObjects = {
  ParentDirectory: path.join(__dirname, '../'),
  Loggers: {
    SystemLogger: CurrentTest.mockConsole(),
    FrameworkLogger: CurrentTest.mockConsole(),
    Output: CurrentTest.getOutput(false, false)
  },
  FrameworkErrors: require('../../lib/Errors'),
  Injector: PluginInjector,
  FrameworkInjector: FrameworkInjector,
  FrameworkOptions: {
    prefix: 'magnum',
    timeout: 2000,
    layers: ['core'],
    pluginSettingsDirectory: CurrentTest.findPluginSettings(mockSettingsPath)
  }
};


FrameworkInjector.service('Options', instanceObjects.FrameworkOptions)
FrameworkInjector.service('LoadedModuleNames', ['TestC','TestG','TestF','TestD','TestE','TestA','TestB'])
FrameworkInjector.service('LoggerBuilder', function(){
  return CurrentTest.mockConsole()
})

FrameworkInjector.service('NameGenerator', NameGenerator)

FrameworkInjector.service('Prefixes', ['magnum'])
FrameworkInjector.service('PrefixSelector', PrefixSelector(['magnum']))

FrameworkInjector.service('FrameworkErrors', instanceObjects.FrameworkErrors)
FrameworkInjector.service('Output', instanceObjects.Loggers.Output);
FrameworkInjector.service('Logger', console)
FrameworkInjector.service('FrameworkLogger', instanceObjects.Loggers.FrameworkLogger)
FrameworkInjector.service('SystemLogger', instanceObjects.Loggers.SystemLogger)




var plugins = [
  CurrentTest.makePlugin('test-a', ['TestC', 'TestG']),
  CurrentTest.makePlugin('test-b', ['TestF']),
  CurrentTest.makePlugin('test-c'),
  CurrentTest.makePlugin('test-d'),
  CurrentTest.makePlugin('test-e'),
  CurrentTest.makePlugin('test-f'),
  CurrentTest.makePlugin('test-g')
]
var expectedOrder = FrameworkInjector.get('LoadedModuleNames')
instanceObjects.loadedModuleNames = expectedOrder


var iteratorInst;

tap.test('Iterator instantiation', function(t) {
  t.plan(1);
  try {
    iteratorInst = new Iterator(plugins, FrameworkInjector);
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
        console.log(plugin.configName);
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
