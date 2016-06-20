/**
 * @file debugDemo
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';

/**
 *
 * @module debugDemo
 */

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
  logger: console,
  parentDirectory: path.join(__dirname, './mocks'),
  applicationDirectory: path.join(__dirname, './mocks'),
  pluginDirectory: path.join(__dirname, './mocks/internalPlugins'),
  pluginSettingsDirectory: path.join(__dirname, './mocks/mockPluginSettings')
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

mockery.registerSubstitute('magnum-test-a', './mocks/externalPlugins/magnum-test-a');
mockery.registerSubstitute('magnum-test-b', './mocks/externalPlugins/magnum-test-b');
mockery.registerSubstitute('magnum-test-c', './mocks/externalPlugins/magnum-test-c');
mockery.registerSubstitute('magnum-test-d', './mocks/externalPlugins/magnum-test-d');
mockery.registerSubstitute('magnum-test-e', './mocks/externalPlugins/magnum-test-e');
mockery.registerSubstitute('magnum-test-f', './mocks/externalPlugins/magnum-test-f');
mockery.registerSubstitute('magnum-test-g', './mocks/externalPlugins/magnum-test-g');

var LoadIndex = require('../index');
var Loader = LoadIndex(pkgJson, loaderOptions);

Loader.on('ready', function(){
  Loader.load()

});

Loader.on('error', function(err){
})

Loader.on('load', function(){
  Loader.start()
})

Loader.on('start', function(){
  setTimeout(function(){
    Loader.stop()
  }, 3000)
})