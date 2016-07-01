/**
 * @file lateErrors
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';

var tap = require('tap');
var _ = require('lodash');

var Loader = require('../PlatformSetup')('lateErrors', false)

var toTest;

function testConsole(args){
  return _.isFunction(toTest) && toTest(args[0])
}
function makeTest(t, expect){
  return function(value){
    t.equal(value, expect, 'expected: ' + expect);
    toTest = null;
  }
}


tap.test('Late Errors', function(t) {
  t.plan(1);
  Loader.on('ready', function(){
    //toTest = makeTest(t, 'magnum: hookThrows Encountered error while loading. ** this_throws is not defined');
    Loader.load();
  });
  Loader.on('error', function(err){
    t.equal(err.message, "Im broken", 'Plugin emits an error event back up to the Loader.')
  })
});