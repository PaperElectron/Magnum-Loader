/**
 * @file pluginOverride
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

var tap = require('tap');
var _ = require('lodash');

var Loader = require('../PlatformSetup')('pluginOverride', false)

tap.test('Loads plugins', function(t) {
  t.plan(1);
  t.ok(Loader, 'Loader is created.')
})

tap.test('Load event', function(t) {
  Loader.on('error', function(err) {
    throw err
  })
  Loader.on('ready', function(){
    Loader.load()

  });

  Loader.on('load', function(){
    t.plan(2)
    t.throws((function() {
      Loader.load()
    }), 'Throws if load is called more than once.');
    var errs = Loader.getPluginErrors();
    t.equal(errs.length, 0, 'No Plugin errors')
  })
});

tap.test('Overriding a multi plugin module child plugin', function(t){
  t.plan(4);

  var override = Loader.Injector.get('OverrideOk');
  var untouched = Loader.Injector.get('OverrideStock');

  var override2 = Loader.Injector.get('Override2Ok');
  var untouched2 = Loader.Injector.get('Override2Stock');

  t.equal(override.plugin, 'overridden', 'Overridden plugin runs correct code.');
  t.equal(untouched.plugin, 'untouched', 'Untouched multiple plugin runs original code');

  t.equal(override2.plugin, 'overridden', 'Works over multiple plugins');
  t.equal(untouched2.plugin, 'untouched', 'Multiple overridden plugins still run correct code.');
});


tap.test('Overriding multiple plugin from other multiple plugin', function(t){
  t.plan(2);
  var override = Loader.Injector.get('Override3Ok');
  var untouched = Loader.Injector.get('Override3Stock');
  t.equal(untouched.plugin, 'untouched', 'Untouched multiple plugin runs original code');
  t.equal(override.plugin, 'overridden from multiple', 'Multiple plugin provides override hooks.')
});