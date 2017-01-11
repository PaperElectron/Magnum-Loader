/**
 * @file working
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */
'use strict';

var tap = require('tap');
var _ = require('lodash');

var Loader = require('../PlatformSetup')('working', false)

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
  t.equal(plugins.length, 10, 'Has 10 loaded plugins.');

});

tap.test('Plugin metadata correctly set.', function(t) {
  var l = _.flatten(_.union(_.values(Loader.getLoaded())));
  t.plan(l.length * 2);

  l.forEach(function(p){
    t.equal(p.loaded, true, p.configName + ' loaded.');
    t.type(p.configName, 'string', 'humanName is type string.');
  })
})

tap.test('Adds merged Plugins', function(t){
  t.plan(3)
  var Merge = Loader.Injector.get('Merge');
  t.type(Merge, Object, 'Returned Object')
  t.equal(Merge.first, 'first', 'Property "first" is correct');
  t.equal(Merge.second, 'second', 'Property "second" is correct');
})


tap.test('Adds factories to the DI framework', function(t){
  t.plan(2)
  Loader.Injector.inject(function(A){
    t.equals(A.name, 'test-a', 'Provides the correct object when injected.')
  });

  var a = Loader.Injector.get('A');
  var b = Loader.Injector.get('A');
  t.notEqual(a.random, b.random, 'Provides distinct instances of the named dependency.')
})

tap.test('Adds Services (Objects) to the DI framework', function(t) {
  t.plan(2)
  var B = Loader.Injector.get('B');
  var BB = Loader.Injector.get('B');
  t.equal(B.name, 'test-b', 'Has the correct Object');
  t.equal(BB.random, B.random, 'Provides the same instance of the named dependency.')
})

tap.test('Correctly configures multiple plugins', function(t) {
  t.plan(3)
  var MultipleConfig1 = Loader.Injector.get('MultipleConfig1')
  t.ok(MultipleConfig1, 'Returns an object.')
  t.equal(MultipleConfig1.defaultName, 'MultipleConfig1', 'Default options value should remain unchanged.');
  t.equal(MultipleConfig1.setName, 'setExternally', 'Default options value should be overwritten by config file.')
})

tap.test('Plugin TestG should be disabled from config setting', function(t){
  t.plan(1)
  var G = Loader.Injector.get('G')
  t.notOk(G, 'TestG should not have loaded a dependency.')
});

tap.test('Plugins have access to the PluginInjector object inside the load hook.', function(t) {
  t.plan(2)
  var UseInjector = Loader.Injector.get('InjectorTest');
  t.ok(UseInjector.Injected, 'Plugin returned its dependency correctly.');
  t.equal(UseInjector.Injected.name, 'Test', 'Injected function returned correct value');
});

tap.test('Starting plugins', function(t) {
  Loader.on('start', function(){
    t.pass('Loader started');
    t.end()
  })
  Loader.start()
})

tap.test('Stopping plugins',{timeout: 3000}, function(t){
  Loader.on('error', function(err){
    t.equals(err.message, 'Timeout exceeded (2000ms) attempting to stop TestC')
  })
  Loader.on('stop', function(){
    t.end()
  });
  Loader.stop();
})
