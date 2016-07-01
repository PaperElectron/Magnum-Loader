/**
 * @file Installation
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
var tap = require('tap');
var _ = require('lodash');
var path = require('path');
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs-extra'));

var targetWorkDir = path.join(__dirname, '../mocks/_integration/Installation/application/TestA');

var TestFile = path.join(targetWorkDir, 'justOne.js')
var CreatedTestDir = path.join(targetWorkDir, 'test')
var NestedTestFile = path.join(CreatedTestDir, 'test.js')
var NestedTestFile2 = path.join(CreatedTestDir, 'test2.js')

var keepPath = path.join(targetWorkDir, '.keep');
var Loader

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

tap.test('Empty workDir', function(t) {
  return fs.emptyDirAsync(targetWorkDir)
    .then(function(){
      return fs.outputFileAsync(keepPath, '')
    })
    .then(function(result) {
      return t.test('Removed', function(t) {
        return t.end()
      })
    })
})

tap.test('Installs files', function(t) {
  var Loader = require('../PlatformSetup')('Installation', false)
  t.ok(Loader, 'It is created')

  Loader.on('ready', function() {
    Loader.load()

  });
  Loader.on('load', function() {
    t.throws((function() {
      Loader.load()
    }), 'Throws if load is called more than once.');
    t.end()
  })
  Loader.on('error', function(err) {
    console.log(err);
  })
});

tap.test('Files Should be created', function(t) {
  // t.plan(4)
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
      t.end()
    })
})

tap.test('Rempty Workdir', function(t) {
  return fs.emptyDirAsync(targetWorkDir)
    .then(function(){
      return fs.outputFileAsync(keepPath, '')
    })
    .then(function(result) {
      return t.test('Removed', function(t) {
        return t.end()
      })
    })
})