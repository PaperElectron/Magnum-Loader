/**
 * @file working
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

var tap = require('tap');
var mockery = require('mockery');
var _ = require('lodash');
var path = require('path');
var mockConsole = {
  log: _.noop,
  warn: _.noop,
  error: _.noop,
  info: _.noop
};

var pluginOptions = {
  test_g: {
    disabled: true
  },
  test_a: {
    host: 'localhost',
    port: 3006
  },
  multipleConfig: {
    MultipleConfig1: {setName: 'setExternally'}
  }
};
var loaderOptions = {
  prefix: 'magnum',
  layers: ['core', 'data', 'dependency', 'platform'],
  logger: mockConsole,
  parentDirectory: path.join(__dirname, '../mocks'),
  applicationDirectory: path.join(__dirname, '../mocks'),
  pluginDirectory: path.join(__dirname, '../', '/mocks/internalPlugins'),
  pluginOptions: path.join(__dirname, '../mocks/mockPluginSettings')
};

var pkgJson = {
  "dependencies": {
    "magnum-test-a": "0.0.0",
    "magnum-test-b": "0.0.0",
    "magnum-test-c": "0.0.0",
    "magnum-test-e": "0.0.0",
    "magnum-test-f": "0.0.0",
    "magnum-test-g": "0.0.0"
  }
};

mockery.enable({
  useCleanCache: true,
  warnOnUnregistered: false
});

mockery.registerSubstitute('magnum-test-a', '../mocks/externalPlugins/magnum-test-a');
mockery.registerSubstitute('magnum-test-b', '../mocks/externalPlugins/magnum-test-b');
mockery.registerSubstitute('magnum-test-c', '../mocks/externalPlugins/magnum-test-c');
mockery.registerSubstitute('magnum-test-d', '../mocks/externalPlugins/magnum-test-d');
mockery.registerSubstitute('magnum-test-e', '../mocks/externalPlugins/magnum-test-e');
mockery.registerSubstitute('magnum-test-f', '../mocks/externalPlugins/magnum-test-f');
mockery.registerSubstitute('magnum-test-g', '../mocks/externalPlugins/magnum-test-g');

var LoadIndex = require('../../index');
var Loader = LoadIndex(pkgJson, loaderOptions, pluginOptions);

tap.test('Instantiation', function(t){
  t.plan(1);
  t.ok(Loader, 'It is created')

});

tap.test('Load event', function(t) {
  Loader.on('ready', function(){
    Loader.load()

  });

  Loader.on('load', function(){
    t.throws((function() {
      Loader.load()
    }), 'Throws if load is called more than once.');
    t.end()
  })
});

tap.test('Loading plugins', function(t){
  t.plan(6);
  var core = Loader.getLoaded('core');
  t.type(core, Array, 'Core returned Array');
  t.equal(core.length, 8, 'Has 8 loaded core plugins.');

  var dependency = Loader.getLoaded('dependency');
  t.type(dependency, Array, 'Dependency returned Array');
  t.equal(dependency.length, 1, 'Has 1 loaded dependency plugin.');

  var platform = Loader.getLoaded('platform');
  t.type(platform, Array, 'Platform returned Array');
  t.equal(platform.length, 1, 'Has 1 loaded platform plugins.')
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
