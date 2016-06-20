/**
 * @file nameGenerator
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
var tap = require('tap');
var g = require('../../lib/Validators/NameGenerator');
var generate = g('magnum');
/**
 *
 * @module nameGenerator
 */

tap.test('Is idempotent', function(t) {
  t.plan(2)

  t.test('Strips prefix, handles underscores', function(c){
    c.plan(6)
    var TapTest = generate('magnum-tap-test')
    c.equal(TapTest, 'TapTest', 'magnum-tap-test => TapTest')
    c.equal(generate(TapTest), 'TapTest', 'TapTest => TapTest')

    TapTest = generate('tap_test')
    c.equal(TapTest, 'TapTest', 'tap-test => TapTest')
    c.equal(generate(TapTest), 'TapTest', 'TapTest => TapTest')

    TapTest = generate('magnum-tAp_T_Es_t')
    c.equal(TapTest, 'TApTEsT', 'magnum-tAp_TEst => TApTEsT')
    c.equal(generate(TapTest), 'TApTEsT', 'TApTEsT => TApTEsT')
  })

  t.test('Longer input', function(c) {
    c.plan(4)
    var SomeFancyPluginName = generate('some_fancy-plugin_name')
    c.equal(SomeFancyPluginName, 'SomeFancyPluginName', 'some_fancy-plugin_name => SomeFancyPluginName')
    c.equal(generate(SomeFancyPluginName), 'SomeFancyPluginName', 'SomeFancyPluginName => SomeFancyPluginName')

    SomeFancyPluginName = generate('SOME_fancy-PLUGIN_name')
    c.equal(SomeFancyPluginName, 'SomeFancyPluginName', 'SOME_fancy-PLUGIN_name => SomeFancyPluginName')
    c.equal(generate(SomeFancyPluginName), 'SomeFancyPluginName', 'SomeFancyPluginName => SomeFancyPluginName')
  })

})