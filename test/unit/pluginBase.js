/**
 * @file pluginBase
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

"use strict";

var tap = require('tap');
var mockery = require('mockery');
var path = require('path');
var util = require('util');
var RawPlugin = require(path.join(__dirname, '../../', 'lib/Plugin/RawPlugin'));
var PluginBase = require(path.join(__dirname, '../../', 'lib/Plugin/PluginBase'));
var PHelpers = require('../helpers/PluginHelpers');
var injector = require('magnum-di');


mockery.enable({
  useCleanCache: true,
  warnOnUnregistered: false
});

var pin_Missing = {
  loaded: {
  }
};

var instanceObjects = {
  Logger: console,
  Injector: injector,
  Output: {options: {verbose: true}},
  FrameworkOptions: {
    prefix: 'magnum',
    timeout: 2000,
    layers: ['core'],
    parentDirectory: path.join(__dirname, '../mocks'),
  }
};

function inst(a, b, c){
  var args = arguments;
  return function(){
    return PluginBase.apply(PluginBase, args)
  }

}

tap.test('PluginBase module handles correct arguments.', function(t) {
  t.plan(4);
  var pBase;
  var plugin = PHelpers.completePlugin('Unit');
  var rp = new RawPlugin(plugin, instanceObjects.FrameworkOptions.layers);
  function noThrow(){
    pBase = new PluginBase(rp, {}, instanceObjects)
  }
  t.doesNotThrow(noThrow, 'Throws no errors');
  t.ok(pBase, 'Plugin base exists');
  t.equal(pBase.declaredName, 'Test_Plugin', 'Correct values set');
  t.type(pBase.configName, 'string', 'Generated humanName is a string');
});

tap.test('Produces an invalid plugin when workDir is a file', function(t){
  t.plan(3);

  var rawPlugin1 = PHelpers.completePlugin('test-2', {workDir:'mockWorkDir/.gitkeep'})
  var plugin = new RawPlugin(rawPlugin1, instanceObjects.FrameworkOptions.layers)
  var bp1 = new PluginBase(plugin, {}, instanceObjects)
  t.ok(bp1, 'PluginBase Created')
  t.equal(bp1.Errors.length, 1, 'Has the correct Errors length')
  t.notOk(bp1.valid, 'Not a valid PluginBase')
})

tap.test('Produces an invalid plugin when workDir does not exist.', function(t) {
  t.plan(5);

  var rawPlugin3 = PHelpers.completePlugin('test-3', {workDir:'mockWorkDerp'})
  var plugin = new RawPlugin(rawPlugin3, instanceObjects.FrameworkOptions.layers)
  var bp3 = new PluginBase(plugin, {}, instanceObjects)
  t.ok(bp3, 'PluginBase Created')
  t.ok(bp3.hasErrors(), 'hasErrors returns true');
  t.equal(bp3.getErrors().moduleName, 'test-3')
  t.equal(bp3.Errors.length, 1, 'Has one Error')
  t.notOk(bp3.valid, 'Not valid')
});

tap.test('Computes workDir absolute path correctly when workDir is a directory.', function(t){
  t.plan(2)
  var rawPlugin2 = PHelpers.completePlugin('test-3', {workDir:'mockWorkDir'})
  var plugin = new RawPlugin(rawPlugin2, instanceObjects.FrameworkOptions.layers)
  var bp2 = new PluginBase(plugin, {}, instanceObjects)
  t.ok(bp2, 'PluginBase Created')

  var computedPath = bp2.computedOptions.workDir;
  var expectedPath = path.join(__dirname, '../mocks', 'mockWorkDir');
  t.equal(computedPath, expectedPath , 'Sets the correct plugin working directory')
})



function BaseValidation(){
  var thisErr = Error.apply(this, arguments);
  thisErr.name = this.name = "BaseValidation";
  this.message = thisErr.message;
  Error.captureStackTrace(this, this.constructor)
}

util.inherits(BaseValidation, Error);

tap.test('Validates custom error objects exported by a plugin.', function(t) {
  t.plan(3);
  var errs = {
      BaseValidation: PHelpers.BaseValidation,
      NotAnError: {name: 'NotAnError'},
      NotAnErrorConstructor: function NotAnErrorConstructor(){
      this.name = 'NotAnErrorConstructor';
      this.message = ''
    }
  }
  var rawPlugin = PHelpers.completePlugin('test-4', false, false, errs)
  var plugin = new RawPlugin(rawPlugin, instanceObjects.FrameworkOptions.layers)

  var errorBase = new PluginBase(plugin, {}, instanceObjects);
  t.ok(errorBase.errors.BaseValidation, 'Adds an Error function that inherits from the Error prototype');
  t.notOk(errorBase.errors.NotAnError, 'Does not add a plain Object');
  t.notOk(errorBase.errors.NotAnErrorConstructor, 'Does not add a constructor not inheriting from Error');
});

tap.test('Config name from modulename', function(t){
  t.plan(4)
  t.throws(PluginBase.validConfigName, 'Throws with missing module name.')
  t.equal(PluginBase.validConfigName('test-a-1', 'test'), 'a_1', "Strips prefix, and replaces - with _");
  t.equal(PluginBase.validConfigName('testPlugin', 'test'), 'testPlugin', 'Leaves unprefixed names without - alone.')
  t.equal(PluginBase.validConfigName('my-plugin', 'test'), 'my_plugin', 'Replaces _ with - in unprefixed plugins.')
});

tap.test('Getting default and computed plugin config object with no user config provided.', function(t) {
  t.plan(1)
  var plugin = PHelpers.completePlugin('test-5', {host: 'localhost', password: 'password'})
  var rawPlugin = new RawPlugin(plugin, instanceObjects.FrameworkOptions.layers);
  var configPlugin = new PluginBase(rawPlugin, {}, instanceObjects)
  var defaultOpts = configPlugin.getDefaultConfig();
  var computedOpts = configPlugin.getComputedConfig()
  t.deepEqual(defaultOpts, computedOpts, 'Default and computed Options match with no provided config.')
});

tap.test('Getting default and computed plugin config object with user config provided.', function(t) {
  t.plan(4)
  var plugin = PHelpers.completePlugin('test-5', {host: 'localhost', password: 'password'})
  var rawPlugin = new RawPlugin(plugin, instanceObjects.FrameworkOptions.layers);
  var configPlugin = new PluginBase(rawPlugin, {test_5: {host: '192.168.1.100', password: 'P@@$W0rD'}}, instanceObjects)

  var defaultOpts = configPlugin.getDefaultConfig();
  var computedOpts = configPlugin.getComputedConfig();
  t.equal(defaultOpts['test_5'].host, 'localhost', 'Default option value "host" unchanged.');
  t.equal(defaultOpts['test_5'].password, 'password', 'Default option value "password" unchanged.');
  t.equal(computedOpts['test_5'].host, '192.168.1.100', 'Computed option value "host" correct.');
  t.equal(computedOpts['test_5'].password, 'P@@$W0rD', 'Computed option value "password" correct.')
});

tap.test('Default and computed plugin configs return false if not present',function(t) {
  t.plan(2)
  var plugin = PHelpers.completePlugin('test-5', {})

  var rawPlugin = new RawPlugin(plugin, instanceObjects.FrameworkOptions.layers);
  var configPlugin = new PluginBase(rawPlugin, {test_5: {host: '192.168.1.100', password: 'P@@$W0rD'}}, instanceObjects)
  var defaultOpts = configPlugin.getDefaultConfig();
  var computedOpts = configPlugin.getComputedConfig();
  t.equal(defaultOpts, false, 'Default options are false.');
  t.equal(computedOpts, false, 'Computed options are false.');
})


function load(injector, loaded){return loaded(null, {ok: true})}
function isDone(done) {
  return done(null)
}

