/**
 * @file PlatformSetup
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';

/**
 *
 * @module PlatformSetup
 */

var mockery = require('mockery');
var _ = require('lodash');
var path = require('path');
var LoadIndex = require('../index');



module.exports = function(mockPath, verbose, overrideConsole){
  // process.chdir(path.join(__dirname, './mocks', '/_integration', mockPath))
  var parentDir = path.join(__dirname, './mocks', '/_integration', mockPath)
  // var cwd = process.cwd()
  var loaderOptions = {
    prefix: 'magnum',
    layers: ['core', 'data', 'dependency', 'platform'],
    logger: overrideConsole || mockConsole(verbose),
    parentDirectory: parentDir,
    applicationDirectory: path.join(parentDir,'./application'),
    pluginDirectory: path.join(parentDir,'./plugins'),
    pluginSettingsDirectory: path.join(parentDir, './pluginSettings')
  };

  var pkgJson = require(path.join(parentDir, './package.json'))

  mockery.enable({
    useCleanCache: true,
    warnOnUnregistered: false
  });

  _.mapValues(pkgJson.dependencies, function(version, prop){
    mockery.registerSubstitute(prop, path.join(parentDir,'./n_modules/', prop));
  })

  var Loader = LoadIndex(pkgJson, loaderOptions);
  return Loader
}

function mockConsole(verbose){

  if(verbose) return console

  return {
    log: function(){},
    error: function(){},
    info: function(){},
    warn: function(){},
  }
}