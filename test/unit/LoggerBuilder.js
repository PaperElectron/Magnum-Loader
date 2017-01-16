/**
 * @file loggerBuilder
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';

var tap = require('tap');
var mockery = require('mockery');
mockery.enable({
  useCleanCache: true,
  warnOnUnregistered: false
});
var LoggerBuilder = require('../../lib/LoggerBuilder');
var Output = {
  chalk: require('chalk')
}

var noOp = {
  log:  function(){return true},
  info: function(){return true},
  error: function(){return true},
  warn: function(){return true}
}

tap.test('Verbose loggers', function(t){
  t.plan(1)
  var verbose = LoggerBuilder(console,'Test', Output, true, false)
  t.ok(verbose, 'Creates logger');
})

tap.test('Non Verbose loggers', function(t){
  t.plan(1)
  var nonVerbose = LoggerBuilder(console,'Test', Output, false, false)
  t.ok(nonVerbose, 'Creates logger');
})

tap.test('NoOP logger verbose', function(t) {
  t.plan(5)
  var NoOutput = LoggerBuilder(noOp,'Test', Output, true, false)
  t.ok(NoOutput, 'Creates logger');
  t.ok(NoOutput.log('hello'));
  t.ok(NoOutput.info('hello'));
  t.ok(NoOutput.error('hello'));
  t.ok(NoOutput.warn('hello'));
})

tap.test('NoOP logger non verbose', function(t) {
  t.plan(5)
  var NoOutput = LoggerBuilder(noOp,'Test', Output, false, false)
  t.ok(NoOutput, 'Creates logger');
  t.ok(NoOutput.log('hello'));
  t.ok(NoOutput.info('hello'));
  t.ok(NoOutput.error('hello'));
  t.ok(NoOutput.warn('hello'));
})