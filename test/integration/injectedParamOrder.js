/**
 * @file injectedParamOrder
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';

var tap = require('tap');
var _ = require('lodash');

var Loader = require('../PlatformSetup')('injectedParamOrder', false)

tap.test('Instantiation', function(t){
  t.plan(1);
  t.ok(Loader, 'It is created')

});

tap.test('Load event', function(t) {
  Loader.on('ready', function(){
    Loader.load()

  });

  Loader.on('error', function(err){
    console.log(err);
  })

  Loader.on('load', function(){
    t.plan(2)
    t.throws((function() {
      Loader.load()
    }), 'Throws if load is called more than once.');
    var errs = Loader.getPluginErrors();
    t.equal(errs.length, 0, 'No Plugin errors')
  })
});

tap.test('Loading plugins', function(t){
  t.plan(2);
  var plugins = Loader.getLoaded();
  t.type(plugins, Array, 'Returned Array');
  t.equal(plugins.length, 3, 'Has 3 loaded plugins.');
});

tap.test('Orders plugins correctly depending on an injected parameter name.', function(t){
  var expectedOrder = [ 'ApplicationEnvironment', 'SetParameter', 'NoParam' ];
  var plugins = Loader.getLoaded()
  t.plan(plugins.length)

  _.each(plugins, function(plug, k){
    t.same(plug.configName, expectedOrder[k], plug.configName + ' - Should match expected -' + expectedOrder[k])
  })
  
})