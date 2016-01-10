/**
 * @file plugin
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

"use strict";

var tap = require('tap');
var mockery = require('mockery');
var path = require('path');
var Plugin = require(path.join(__dirname, '../../', 'lib/Plugin/Plugin'));
var injector = require('magnum-di');

mockery.enable({
  useCleanCache: true,
  warnOnUnregistered: false
});

var pin_Missing = {
  loaded: {
    //metadata:{layer: 'core'}
  }
};

var instanceObjects = {
  Logger: console,
  Injector: injector,
  Output: {options: {verbose: true}},
  FrameworkOptions: {
    timeout: 2000,
    layers: ['core']
  }
};

function inst(a, b, c){
  var args = arguments;
  return function(){
    return Plugin.apply(Plugin, args)
  }

}

tap.test('Plugin Module improper instantiation.', function(t) {

  t.plan(10);
  t.throws(inst(), /Plugin requires 3 arguments/, 'Throws with no args');
  t.throws(inst({}), /Plugin requires 3 arguments/, 'Throws with 1 arg');
  t.throws(inst({},{}), /Plugin requires 3 arguments/, 'Throws with 2 args');
  t.throws(inst(pin_Missing, {}, instanceObjects), /No module name/, 'Throws with no module name');

  pin_Missing.moduleName = 'test-1';
  t.throws(inst(pin_Missing, {}, instanceObjects), /Metadata missing or invalid/, 'Throws with no metadata.');

  pin_Missing.loaded.metadata = {};
  t.throws(inst(pin_Missing, {}, instanceObjects), /metadata.name missing/, 'Throws with no metadata.name property');

  pin_Missing.loaded.metadata = {name: 'Unit'};
  t.throws(inst(pin_Missing, {}, instanceObjects), /metadata.layer missing/, 'Throws with no metadata.layer property');

  pin_Missing.loaded.metadata = {name: 'Unit', layer: 'core'};
  t.throws(inst(pin_Missing, {}, instanceObjects), /metadata.type missing/, 'Throws with no metadata.type property');

  pin_Missing.loaded.metadata = {name: 'Unit', layer: 'core', type: 'service'};
  t.throws(inst(pin_Missing, {}, instanceObjects), /Does not contain a plugin property/, 'Throws with no plugin property');

  pin_Missing.loaded.plugin = {};
  t.throws(inst(pin_Missing, {}, instanceObjects), /Missing hook methods/, 'Throws with missing hook methods.')
});

tap.test('Plugin module instantiates with correct args', function(t) {
  var plugin;
  t.plan(3);

  pin_Missing.loaded.plugin = {load: load, start: isDone, stop: isDone};

  function noThrow(){
    plugin = new Plugin(pin_Missing, {}, instanceObjects)
  }
  t.doesNotThrow(noThrow, 'Instantiates');
  t.ok(plugin, 'Plugin exists');
  t.equals(plugin.declaredName, 'Unit', 'Correct values set');

});


function load(injector, loaded){return loaded(null, {ok: true})}
function isDone(done) {
  return done(null)
}