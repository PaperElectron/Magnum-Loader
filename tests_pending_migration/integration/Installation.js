/**
 * @file Installation
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
var tap = require('tap');
var mockery = require('mockery');
var _ = require('lodash');
var path = require('path');
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs-extra'));
var mockConsole = {
  log: _.noop,
  warn: _.noop,
  error: _.noop,
  info: _.noop
};

var targetWorkDir = path.join(__dirname, '../mocks/mockWorkDir');
var TestFile = path.join(targetWorkDir, 'justOne.js')
var CreatedTestDir = path.join(targetWorkDir, 'test')
var NestedTestFile = path.join(CreatedTestDir, 'test.js')
var NestedTestFile2 = path.join(CreatedTestDir, 'test2.js')

var gitkeepPath = path.join(targetWorkDir, '.gitkeep');

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
  pluginDirectory: path.join(__dirname, '../', '/mocks/installerPlugins'),
  pluginSettingsDirectory: path.join(__dirname, '../mocks/mockPluginSettings')
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


tap.test('Empty workDir', function(t){
  return fs.emptyDirAsync(targetWorkDir)
    .then(function(result) {
      t.end()
    })
})
  .then('Replace gitkeep', function(t){

    return fs.outputFileAsync(gitkeepPath)
      .then(function(result) {
        console.log('sdsadadasd4hv');
        t.end()
      })
})
  .then(function() {
  var Loader = LoadIndex(pkgJson, loaderOptions);
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

      testFileCreation()
      t.end()
    })
    Loader.on('error', function(err){
      console.log(err);
    })
  })
});

function testFileCreation(done) {
  tap.test('Files Should be created', function(t) {
    t.plan(4)
    return fs.statAsync(TestFile)
      .then(function(file) {
        t.ok(file.isFile(), 'workdir/justOne.js created')

        return fs.statAsync(CreatedTestDir)
      })
      .then(function(dir) {
        t.ok(dir.isDirectory(), 'workdir/test directory created')
        return fs.statAsync(NestedTestFile)
      })
      .then(function(file) {
        t.ok(file.isFile(), 'workdir/test/test.js created')
        return fs.statAsync(NestedTestFile)
      })
      .then(function(file) {
        t.ok(file.isFile(), 'workdir/test/test2.js created')
      })
  })
}
