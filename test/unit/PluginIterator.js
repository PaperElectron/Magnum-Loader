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

let TestBuilder = require('../TestBuilder')
let CurrentTest = new TestBuilder()

var PluginInjector = CurrentTest.getPluginDI()// DI();
var FrameworkInjector = CurrentTest.getFrameworkDI();

var NameGenerator = require(path.join(__dirname, '../../', 'lib/Validation/NameGenerator'))
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

FrameworkInjector.service('NameGenerator', NameGenerator('magnum'))

FrameworkInjector.service('FrameworkErrors', instanceObjects.FrameworkErrors)
FrameworkInjector.service('Output', instanceObjects.Loggers.Output);
FrameworkInjector.service('Logger', console)
FrameworkInjector.service('FrameworkLogger', instanceObjects.Loggers.FrameworkLogger)
FrameworkInjector.service('SystemLogger', instanceObjects.Loggers.SystemLogger)

var plugins = [
  CurrentTest.makePlugin('test-a', ['TestC']),
  CurrentTest.makePlugin('test-b'),
  CurrentTest.makePlugin('test-c')
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


