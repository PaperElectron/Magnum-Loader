/**
 * @file rawPlugin
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

mockery.enable({
  useCleanCache: true,
  warnOnUnregistered: false
});

var incompletePlugin = {
  moduleName: 'test-raw-plugin',
  loaded: {
    options: {},
    metadata: {},
    plugin: {}
  }
}

tap.test('Loading raw plugins', function(t){
  t.plan(1);
  t.throws(function() {
    new RawPlugin()
  }, 'Throws with no args')
})

tap.test('Returns with errors with no data.', function(t) {
  t.plan(5)
  var rp = new RawPlugin(incompletePlugin, ['core', 'data','server']);
  t.ok(rp, 'Returns "something"');
  t.ok(rp.hasErrors(), 'Has some errors to report.');
  var errors = rp.getErrors()
  t.equal(errors.moduleName, 'test-raw-plugin', 'Returned Errors has correct module name');
  t.equal(errors.Errors.length, 2);
  t.equal(rp.isValid(), false, 'Not a valid plugin.');
})

tap.test('Returns with errors on partial data', function(t) {
  t.plan(1)
  incompletePlugin.loaded.metadata = {herp: 10, inject: 'service'}
  var rp1 = new RawPlugin(incompletePlugin, ['core', 'data','server']);
  var rp1errs = rp1.getErrors()
  t.equal(rp1errs.Errors.length, 3);
})

tap.test('Returns with errors from bad layer', function(t) {
  t.plan(1)
  incompletePlugin.loaded.metadata = {name: 'Raw_Plugin', layer: 'nope',inject: 'service'}
  var rp1 = new RawPlugin(incompletePlugin, ['core', 'data','server']);
  var rp1errs = rp1.getErrors()
  t.equal(rp1errs.Errors.length, 2, 'Correct number of errors');
})

tap.test('Returns with errors from missing or invalid hook functions', function(t) {
  t.plan(1)
  incompletePlugin.loaded.metadata = {name: 'Raw_Plugin', layer: 'core',inject: 'service'}
  var rp1 = new RawPlugin(incompletePlugin, ['core', 'data','server']);
  var rp1errs = rp1.getErrors()
  t.equal(rp1errs.Errors.length, 1, 'Correct number of errors');
})

tap.test('Returns with errors from invalid hook functions', function(t) {
  t.plan(1)
  incompletePlugin.loaded.metadata = {name: 'Raw_Plugin', layer: 'core',inject: 'service'}
  incompletePlugin.loaded.plugin = {load: load, start: 1, stop: 1}
  var rp1 = new RawPlugin(incompletePlugin, ['core', 'data','server']);
  var rp1errs = rp1.getErrors()
  t.equal(rp1errs.Errors.length, 1, 'Correct number of errors');
})

tap.test('Returns with no errors.', function(t) {
  t.plan(2)
  incompletePlugin.loaded.metadata = {name: 'Raw_Plugin', layer: 'core',inject: 'service'}
  incompletePlugin.loaded.plugin = {load: load, start: isDone, stop: isDone}
  var rp1 = new RawPlugin(incompletePlugin, ['core', 'data','server']);
  var rp1errs = rp1.getErrors()
  t.equal(rp1errs.Errors.length, 0, 'Correct number of errors');
  t.ok(rp1.isValid(), 'Is a valid plugin')
})

tap.test('Valid RawPlugin methods.', function(t) {
  t.plan(5)
  incompletePlugin.loaded.options = {value1: 10, someString: 'hello'};
  incompletePlugin.loaded.metadata = {name: 'Raw_Plugin', layer: 'core',inject: 'service'}
  incompletePlugin.loaded.plugin = {load: load, start: isDone, stop: isDone}
  incompletePlugin.loaded.errors = {BaseValidation: BaseValidation}
  var rp = new RawPlugin(incompletePlugin, ['core', 'data','server']);
  var rperrs = rp.getErrors()
  var defaultOptions
  t.equal(rperrs.Errors.length, 0);
  t.ok(rp.isValid(), 'Is a valid plugin');
  defaultOptions = rp.getDefaultOptions()
  t.ok(defaultOptions, 'Returns default options.');
  t.equal(defaultOptions.value1, 10, 'Correct options.value1');
  t.equal(defaultOptions.someString, 'hello','Correct options.someString');
})


function load(injector, loaded){return loaded(null, {ok: true})}
function isDone(done) {
  return done(null)
}
function BaseValidation(){
  var thisErr = Error.apply(this, arguments);
  thisErr.name = this.name = "BaseValidation";
  this.message = thisErr.message;
  Error.captureStackTrace(this, this.constructor)
}

util.inherits(BaseValidation, Error);