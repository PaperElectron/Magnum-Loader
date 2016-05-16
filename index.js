/**
 * @file index.js
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Magnum-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
var version = require('./package.json').version
var Injector = require('magnum-di');
var PluginFactory = require('./lib/PluginFactory');
var PluginIterator = require('./lib/PluginIterator');
var MagnumLoader = require('./lib/MagnumLoader');
var OptionParser = require('./lib/FrameworkOptions');
var Errors = require('./lib/Errors');
var AppendLogger = require('./lib/LoggerBuilder');
var NameGenerator = require('./lib/Validators/NameGenerator');
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
  var PluginInjector = new Injector();
  var FrameworkInjector = new Injector();

  var FrameworkOptions = OptionParser(frameworkOpts, Errors);

  FrameworkInjector.service('Options', FrameworkOptions);
  FrameworkInjector.service('LoggerBuilder', AppendLogger);
  FrameworkInjector.service('NameGenerator', NameGenerator);

  var Output = require('./lib/Outputs')(FrameworkOptions.colors, FrameworkOptions.verbose);
  var Loggers = {
    Output: Output,
    Logger: FrameworkOptions.logger,
    SystemLogger: AppendLogger(FrameworkOptions.logger, FrameworkOptions.prefix, Output, FrameworkOptions.verbose, 'magenta'),
    FrameworkLogger: AppendLogger(FrameworkOptions.logger, FrameworkOptions.prefix, Output, true, 'magenta')
  };
  PluginInjector.service('Errors', Errors);
  PluginInjector.service('Logger', Loggers.Logger);
  PluginInjector.service('Env', process.env);

  Loggers.FrameworkLogger.log('Loader version '+ version + ' setup complete')

  var pkgDependencies = _.keys(pkgJson.dependencies)
  if(!pkgDependencies){
    Loggers.FrameworkLogger.log('No Dependencies found in package.json.')
  }

  var Shared = {
    SharedEvents: SharedEvents,
    FrameworkInjector: FrameworkInjector,
    Injector: PluginInjector,
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
    console.log(err.stack);
    Shared.Loggers.FrameworkLogger.error(Output.failedToLoad( err.failedRequire ) )
    process.exit()
  }

  Shared.loadedModuleNames = _.chain(loadedPlugins).map(function(plugin) {
    return plugin.moduleName
  }).uniq().value()

  var iterator = new PluginIterator(loadedPlugins, FrameworkOptions.layers, Shared);

  return MagnumLoader(iterator, Shared);
};