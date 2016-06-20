/**
 * @file multiPlugins
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';

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

var loaderOptions = {
  prefix: 'magnum',
  layers: ['core', 'data', 'dependency', 'platform'],
  logger: mockConsole,
  colors: true,
  parentDirectory: path.join(__dirname, '../mocks'),
  pluginDirectory: path.join(__dirname, '../', '/mocks/multiPlugins/pluginDir'),
  pluginSettingsDirectory: path.join(__dirname, '../mocks/multiPlugins/settings')
};

var pkgJson = {
  "dependencies": {
    "magnum-multi": "0.0.0"
  }
};

mockery.enable({
  useCleanCache: true,
  warnOnUnregistered: false
});
mockery.registerSubstitute('magnum-multi', '../mocks/multiPlugins/n_modules/magnum-multi');

var LoadIndex = require('../../index');
var Loader = LoadIndex(pkgJson, loaderOptions);

tap.test('Loads plugins', function(t) {
  t.plan(1);
  t.ok(Loader, 'Loader is created.')
})

tap.test('Load event', function(t) {
  Loader.on('error', function(err) {
  })
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

tap.test('Recursively Loads multi plugins', function(t) {
  t.plan(8)
  var t1 = Loader.Injector.get('Test_1');
  var t2 = Loader.Injector.get('Test_2');
  var t3 = Loader.Injector.get('Test_3');
  var t4 = Loader.Injector.get('Test_4');
  var t5 = Loader.Injector.get('Test_5');
  var t6 = Loader.Injector.get('Test_6');
  var t7 = Loader.Injector.get('Test_7');
  var t8 = Loader.Injector.get('Test_8');
  t.equal(t1.parent, 'magnum-multi', 'Has correct parent module name')
  t.equal(t2.parent, 'magnum-multi', 'Has correct parent module name')
  t.equal(t3.parent, 'magnum-express', 'Has correct parent module name')
  t.equal(t4.parent, 'magnum-express', 'Has correct parent module name')
  t.equal(t5.parent, 'magnum-thingy', 'Has correct parent module name')
  t.equal(t6.parent, 'magnum-thingy', 'Has correct parent module name')
  t.equal(t7.parent, 'magnum-overkill', 'Has correct parent module name')
  t.equal(t8.parent, 'magnum-overkill', 'Has correct parent module name')
})


