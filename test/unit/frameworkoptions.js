/**
 * @file frameworkoptions
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

var tap = require('tap');
var path = require('path');
var Errors = require('../../lib/Errors');
var OptsParser = require('../../lib/FrameworkOptions');

tap.test('Throws correct errors on missing or bad required params.', function(t) {
  t.plan(7)

  /*
   * Check Order
   * !options, !errors, !opts.prefix, !opts.layers, !opts.logger, !opts.parentDirectory
   */

  t.throws(function() {
    OptsParser()
  }, /No Raw Config object provided./, 'No Raw config provided.')

  t.throws(function() {
    OptsParser({})
  }, /No Custom Errors provided./, 'No Custom Errors object provided.')

  t.throws(function() {
    OptsParser({}, Errors)
  }, /options.prefix not set./, 'Options.prefix not provided.')

  t.throws(function() {
    OptsParser({prefix: 'magnum'}, Errors)
  }, /options.layers not set./, 'Options.layers not provided.')

  t.throws(function() {
    OptsParser({prefix: 'magnum', layers: ['core'], parentDirectory: __dirname}, Errors)
  }, /options.logger not set./, 'Options.logger not provided.')

  t.throws(function() {
    OptsParser({prefix: 'magnum', layers: ['core'], logger: console}, Errors)
  }, /options.parentDirectory not set./, 'Options.parentDirectory not provided')

  t.throws(function() {
    OptsParser({prefix: 'magnum', layers: ['core'], logger: console, parentDirectory: '/doesnt/exist'}, Errors)
  }, /options.parentDirectory doesnt exist./, 'Options.parentDirectory doesnt exist.')

});

tap.test('Provided logger missing methods.', function(t) {
  t.plan(1)
  t.throws(function() {
    OptsParser({prefix: 'magnum', layers: ['core'], logger: {}, parentDirectory: __dirname}, Errors)
  }, /Logger object provided is missing log, error, info, warn methods./,'Options.logger missing methods.')
})

tap.test('Options.pluginDirectory not a directory', function(t) {
  t.plan(1)
  t.throws(function(){
    var BadOpts = OptsParser({
      prefix: 'magnum',
      layers: ['core'],
      parentDirectory: __dirname,
      pluginDirectory: __dirname + '/plugin.js',
      logger: console
    }, Errors)
  }, /options.pluginDirectory doesn't exist or is not a directory./)

});

tap.test('Parses Raw framework options correctly and sets defaults', function(t) {
  var GoodOpts = OptsParser({
    prefix: 'magnum',
    layers: ['core'],
    parentDirectory: __dirname,
    logger: console
  }, Errors)

  t.plan(6)
  t.equal(GoodOpts.prefix, 'magnum');
  t.equal(GoodOpts.layers[0], 'core');
  t.equal(GoodOpts.parentDirectory, __dirname);
  t.equal(GoodOpts.pluginDirectory, false);
  t.equal(GoodOpts.timeout, 2000);
  t.ok(GoodOpts.logger)
});

tap.test('Parses Raw framework options correctly explicit plugin dir', function(t) {
  var setPluginDir = OptsParser({
    prefix: 'magnum',
    layers: ['core'],
    parentDirectory: __dirname,
    pluginDirectory: path.join(__dirname,'../','mocks/internalPlugins'),
    verbose: false,
    colors: false,
    logger: console
  }, Errors)

  var falseColorVerbose = OptsParser({
    prefix: 'magnum',
    layers: ['core'],
    parentDirectory: __dirname,
    verbose: false,
    colors: false,
    logger: console
  }, Errors)

  var trueColorVerbose = OptsParser({
    prefix: 'magnum',
    layers: ['core'],
    parentDirectory: __dirname,
    verbose: true,
    colors: true,
    logger: console
  }, Errors)
  t.plan(5)
  t.equal(setPluginDir.pluginDirectory, path.join(__dirname,'../','mocks/internalPlugins'), 'Sets pluginDirectory correctly')
  t.equal(falseColorVerbose.verbose, false, 'options.verbose: false');
  t.equal(falseColorVerbose.colors, false, 'options.colors: false');
  t.equal(trueColorVerbose.verbose, true, 'options.verbose: true');
  t.equal(trueColorVerbose.colors, true, 'options.colors: true');

});