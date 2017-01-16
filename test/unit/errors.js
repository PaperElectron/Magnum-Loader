/**
 * @file errors
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';

var tap = require('tap');
var Errors = require('../../lib/Errors');

tap.test('InvalidPluginsError', function(t){
  t.plan(2);
  var err = new Errors.InvalidPluginsError('You have some invalid plugins');
  t.equal(err.message, 'You have some invalid plugins', 'Has correct message');
  t.equal(err.name, 'InvalidPluginsError', 'Is correct type')
});

tap.test('OptionsError', function(t){
  t.plan(2);
  var err = new Errors.OptionsError('Options are not good.');
  t.equal(err.message, 'Options are not good.', 'Has correct message');
  t.equal(err.name, 'OptionsError', 'Is correct type')
});

tap.test('HookTimeoutError', function(t){
  t.plan(2);
  var err = new Errors.HookTimeoutError('Hook not called in time.');
  t.equal(err.message, 'Hook not called in time.', 'Has correct message');
  t.equal(err.name, 'HookTimeoutError', 'Is correct type');
});

tap.test('PluginHookError', function(t){
  t.plan(5);
  var err = new Errors.PluginHookError('Plugin hook failed to run correctly.');
  t.equal(err.message, 'Plugin hook failed to run correctly.', 'Has correct message');
  t.equal(err.name, 'PluginHookError', 'Is correct type');
  t.ok(err.plugin, 'Has a plugin property');
  t.equal(err.hook, 'No hook name provided.', 'Hook name is correct.');
  t.equal(err.plugin.configName, 'Missing name', 'Plugin.humanName is correct')
});

tap.test('PluginConstructionError', function(t){
  t.plan(4);
  var err = new Errors.PluginConstructionError('Plugin not constucted correctly.');
  t.equal(err.message, 'Plugin not constucted correctly.', 'Has correct message');
  t.equal(err.name, 'PluginConstructionError', 'Is correct type');
  t.ok(err.plugin, 'Has a plugin property');
  t.equal(err.plugin.configName, 'Missing name', 'Plugin.humanName is correct')
});

tap.test('PluginDependencyError', function(t){
  t.plan(5);
  var err = new Errors.PluginDependencyError('Something went wrong with a dependency');
  t.equal(err.message, 'Something went wrong with a dependency', 'Has correct message');
  t.equal(err.name, 'PluginDependencyError', 'Is correct type');
  t.ok(err.plugin, 'Has a plugin property');
  t.equal(err.plugin.configName, 'Missing name', 'Plugin.humanName is correct.');
  t.equal(err.depName, 'Missing dependency name.', 'Dependency name is correct.')
});