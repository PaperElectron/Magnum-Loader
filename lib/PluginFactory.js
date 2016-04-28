/**
 * @file PluginFactory
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
// var Plugin = require('./Plugin/Plugin');
// var Plugin = require('./Plugin/PluginTypes/PluginDependency');

var RawPlugin = require('./Plugin/RawPlugin');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var debug = require('debug')('magnum-loader:pluginFactory');

var PluginPicker = require('./Plugin/Plugin');

/**
 * Ingests modules and returns plugin instances
 * @module PluginFactory
 */


module.exports = function(Dependencies, Shared){
  debug('Starting plugin loading and class instantiations.')
  var instanceObjects = {
    SharedEvents: Shared.SharedEvents,
    ParentDirectory: Shared.ParentDirectory,
    applicationDirectory: Shared.applicationDirectory,
    PluginSettings: Shared.pluginSettings,
    Logger: Shared.Loggers.Logger,
    Injector: Shared.Injector,
    FrameworkInjector: Shared.FrameworkInjector,
    Output: Shared.Loggers.Output,
    FrameworkErrors: Shared.FrameworkErrors,
    FrameworkOptions: Shared.FrameworkOptions
  }

  var FrameworkPlugins = _.chain(fs.readdirSync(path.join(__dirname, './FrameworkPlugins')))
    .filter(function(file){
      return (path.extname(file) === '.js')
    })
    .map(function(file){

      return {
        require: path.join(__dirname, './FrameworkPlugins', file),
        external: false,
        moduleName: path.basename(file, '.js')
      };
    }).value()


  var mergedPlugins = (function(){
    var internalPlugins = [];
    var externalPlugins = _.chain(Dependencies)
      .filter(function(dep) {
        if(dep.indexOf(Shared.FrameworkOptions.prefix + '-') === 0) return dep
      })
      .map(function(dep){
        return {
          require: dep,
          external: true,
          moduleName: dep
        }
      })
      .value()

    if(Shared.FrameworkOptions.pluginDirectory){
      internalPlugins = _.chain(fs.readdirSync(Shared.FrameworkOptions.pluginDirectory))
        .filter(function(file){
          return (path.extname(file) === '.js')
        })
        .map(function(file){

          return {
            require: path.join(Shared.FrameworkOptions.pluginDirectory, file),
            external: false,
            moduleName: path.basename(file, '.js')
          };
        }).value()
    }
    return externalPlugins.concat(internalPlugins.concat(FrameworkPlugins))
  })();

  //Output initial state message.
  var message = 'Requiring ' + mergedPlugins.length + ' Plugin modules.'
  var formattedMessage = Shared.Output.titleAnnounce(message)
  Shared.Loggers.FrameworkLogger.log(formattedMessage);

  var RawPlugins = _.chain(mergedPlugins)
    .map(function(plugin){
      var loadedPlugin = attemptLoad(plugin.require);
      plugin.loaded = loadedPlugin;

      if(_.isArray(plugin.loaded)){
        return _.map(plugin.loaded, function(mPlugin){
          var multiplePlugin = _.chain(plugin).clone().omit('loaded').value();
          multiplePlugin.loaded = mPlugin;
          if(!multiplePlugin.loaded.metadata) {
            multiplePlugin.loaded.metadata = {}
          }
          multiplePlugin.loaded.metadata.multiple = true;

            //TODO: Where is this even used?
          multiplePlugin.loaded.metadata.declaredName = multiplePlugin.loaded.metadata.name;

          return RawPlugin(multiplePlugin, Shared.FrameworkOptions.layers);
        })
      }
      return RawPlugin(plugin, Shared.FrameworkOptions.layers);
    })
    .flatten()
    .filter(Boolean)
    .value()

  var overrides = _.filter(RawPlugins, function(rawPlugin){ return rawPlugin.isOverride()});
  var rawplugins = _.reject(RawPlugins, function(rawPlugin){ return rawPlugin.isOverride()});


  var plugins = _.chain(rawplugins)
    .map(function(plugin) {
      (function() {
        var ovrPlugin = _.chain(overrides)
          .filter(function(ovrp){
          return ovrp.override.module === plugin.moduleName && plugin.metadata.name === ovrp.override.name;
          })
          .first()
          .value()
        if(ovrPlugin){
          plugin.plugin = ovrPlugin.plugin;
          var message = plugin.moduleName + '#' +
            plugin.metadata.name + ' hooks being overridden by plugin ' + ovrPlugin.moduleName


          Shared.Loggers.FrameworkLogger.warn(message);
        }
      })();

      return new PluginPicker(plugin, instanceObjects)

    })
    .flatten()
    .filter(Boolean)
    .filter(function(p){
      return p.isEnabled();
    }).value();
  debug('Finished plugin loading and instantiation.');
  return plugins
};

function attemptLoad(requirePath){
  try {
    debug('Trying stock require. ' + requirePath)
    return require(requirePath);
  }
  catch(e) {
    debug('Stock require failed')
  }
  try {
    debug('Trying parent require. ' + requirePath)
    var prequire = require('parent-require');
    return prequire(requirePath)
  }
  catch(e){
    debug('Parent require failed')
  }
  try{
    debug('Trying to join process.cwd() with local node modules. ' + requirePath)
    return require(path.join(process.cwd(), 'node_modules', requirePath))
  }
  catch(e){
    debug('All loading methods failed for this plugin. ' + requirePath)
    e.failedRequire = requirePath
    throw e
  }
}
