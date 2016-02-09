/**
 * @file index.js
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Magnum-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
var Injector = require('magnum-di');
var PluginFactory = require('./lib/PluginFactory');
var PluginIterator = require('./lib/PluginIterator');
var MagnumLoader = require('./lib/MagnumLoader');
var OptionParser = require('./lib/FrameworkOptions');
var Errors = require('./lib/Errors');
var AppendLogger = require('./lib/LoggerBuilder');
var _ = require('lodash');
var Events = require('events').EventEmitter;
var SharedEvents = new Events();

/**
 * Bit of boilerplate to setup things that are used everywhere.
 * MagnumLoader Object itself is a fairly complex facade that spans several
 * other objects, trying to keep it as simple as possible.
 *
 * @param pkgJson Package.json file, better correspond to the nearest node_modules
 * @param frameworkOpts Configure the loader itself.
 * @param pluginOpts
 * @returns {MagnumLoader}
 */
module.exports = function(pkgJson, frameworkOpts){

  var FrameworkOptions = OptionParser(frameworkOpts, Errors);
  var Output = require('./lib/Outputs')(FrameworkOptions.colors, FrameworkOptions.verbose);
  var Loggers = {
    Output: Output,
    Logger: FrameworkOptions.logger,
    SystemLogger: AppendLogger(FrameworkOptions.logger, FrameworkOptions.prefix, Output, FrameworkOptions.verbose, 'magenta'),
    FrameworkLogger: AppendLogger(FrameworkOptions.logger, FrameworkOptions.prefix, Output, true, 'magenta')
  };
  Injector.service('Errors', Errors);
  Injector.service('Logger', Loggers.Logger);

  var pkgDependencies = _.keys(pkgJson.dependencies)
  if(!pkgDependencies){
    Loggers.FrameworkLogger('No Dependencies found in package.json.')
  }

  var Shared = {
    SharedEvents: SharedEvents,
    Injector: Injector,
    Loggers: Loggers,
    Output: Loggers.Output,
    FrameworkErrors: Errors,
    FrameworkOptions: FrameworkOptions,

    applicationDirectory: FrameworkOptions.applicationDirectory,
    ParentDirectory: FrameworkOptions.parentDirectory,
    additionalPluginDirectory: FrameworkOptions.pluginDirectory,
    pluginSettingsDirectory: FrameworkOptions.pluginSettingsDirectory,
    loaderPrefix: FrameworkOptions.prefix
  }
  try {
    var loadedPlugins = PluginFactory(pkgDependencies, Shared);
  }
  catch(err){
    Shared.Loggers.FrameworkLogger.error(err.message)
    Shared.Loggers.FrameworkLogger.error(Output.failedToLoadPlugin)
    process.exit()
  }

  var iterator = new PluginIterator(loadedPlugins, FrameworkOptions.layers, Shared);

  return MagnumLoader(iterator, Shared);
};