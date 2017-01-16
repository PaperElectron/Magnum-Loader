/**
 * @file ErrorHandling
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
var tap = require('tap');
var _ = require('lodash');
var stripAnsi = require('strip-ansi')

var Console = {
  log: function(a){
  },
  warn: function(){

  },
  error: function(){
    testConsole(arguments)
  },
  info: function(){

  }
};

var toTest;

function testConsole(args){
  return _.isFunction(toTest) && toTest(args[0])
}
function makeTest(t, expect){
  return function(value){
    t.equal(stripAnsi(value), stripAnsi(expect), 'expected: ' + stripAnsi(expect));
    toTest = null;
  }
}


var Loader = require('../PlatformSetup')('errorHandling', false, Console)


tap.test('Load event', function(t) {
  t.plan(2);
  Loader.on('ready', function(){
    toTest = makeTest(t, 'HookThrows: Encountered an error while loading. *** ReferenceError: this_throws is not defined');
    Loader.load();
  });
  Loader.on('error', function(err){
    t.ok(err, "Error emitted")
  })
});