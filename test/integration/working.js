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
  test_a: {
    host: 'localhost',
    port: 3006
  }
};
var loaderOptions = {
  prefix: 'magnum',
  layers: ['core', 'data', 'dependency', 'platform'],
  logger: mockConsole,
  parentDirectory: path.join(__dirname, '../'),
  pluginDirectory: path.join(__dirname, '../', '/plugins'),
};

var pkgJson = {
  "dependencies": {
    "magnum-test-a": "0.0.0",
    "magnum-test-b": "0.0.0",
    "magnum-test-c": "0.0.0",
    "magnum-test-e": "0.0.0",
    "magnum-test-f": "0.0.0"
  }
};

mockery.enable({
  useCleanCache: true,
  warnOnUnregistered: false
});

mockery.registerSubstitute('magnum-test-a', '../mocks/plugins/magnum-test-a');
mockery.registerSubstitute('magnum-test-b', '../mocks/plugins/magnum-test-b');
mockery.registerSubstitute('magnum-test-c', '../mocks/plugins/magnum-test-c');
mockery.registerSubstitute('magnum-test-d', '../mocks/plugins/magnum-test-d');
mockery.registerSubstitute('magnum-test-e', '../mocks/plugins/magnum-test-e');
mockery.registerSubstitute('magnum-test-f', '../mocks/plugins/magnum-test-f');

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
  t.equal(core.length, 6, 'Has 6 loaded core plugins.');

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
    t.equal(p.loaded, true, p.configName + 'loaded.');
    t.type(p.configName, 'string', 'humanName is type string.');
  })
})

tap.test('Adds merged Plugins', function(t){
  t.plan(3)
  var Merge = Loader.Injector.get('Merge');
  t.type(Merge, Object, 'Returned Object')
  t.equals(Merge.first, 'first', 'Property "first" is correct');
  t.equals(Merge.second, 'second', 'Property "second" is correct');
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
  t.equals(B.name, 'test-b', 'Has the correct Object');
  t.equals(BB.random, B.random, 'Provides the same instance of the named dependency.')
})

tap.test('Starting plugins', function(t) {
  Loader.on('start', function(){
    t.pass('Loader started');
    t.end()
  })
  Loader.start()
})

tap.test('Stopping plugins',{timeout: 3000}, function(t){
  Loader.on('error', function(err){
    t.equals(err.message, 'Timeout exceeded (2000ms) attempting to stop test_c')
  })
  Loader.on('stop', function(){
    t.end()
  });
  Loader.stop();
})
