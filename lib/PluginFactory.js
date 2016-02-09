/**
 * @file PluginFactory
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
var Plugin = require('./Plugin/Plugin');
var RawPlugin = require('./Plugin/RawPlugin');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var debug = require('debug')('magnum-loader:pluginFactory');
/**
 * Ingests modules and returns plugin instances
 * @module PluginFactory
 */


module.exports = function(Dependencies, Shared){

  var instanceObjects = {
    SharedEvents: Shared.SharedEvents,
    ParentDirectory: Shared.ParentDirectory,
    applicationDirectory: Shared.applicationDirectory,
    PluginSettings: Shared.pluginSettings,
    Logger: Shared.Loggers.Logger,
    Injector: Shared.Injector,
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
  var formattedMessage = Shared.Output.titleAnnounce(message, 'cyan')
  Shared.Loggers.FrameworkLogger.log(formattedMessage);
  var plugins = _.chain(mergedPlugins)
    .map(function(plugin) {
      /*
       * Attempt to load from parent, if this is a linked module use the workaround.
       */
      var loadedPlugin = attemptLoad(plugin.require);

      plugin.loaded = loadedPlugin;
      if(_.isArray(plugin.loaded)){
        return _.map(plugin.loaded, function(mPlugin){
          var multiplePlugin = _.chain(plugin).clone().omit('loaded').value();
          multiplePlugin.loaded = mPlugin;
          multiplePlugin.loaded.metadata.multiple = true;

          //TODO: Where is this even used?
          multiplePlugin.loaded.metadata.declaredName = multiplePlugin.loaded.metadata.name;
          var raw = new RawPlugin(multiplePlugin, Shared.FrameworkOptions.layers);
          return new Plugin(raw, instanceObjects);
        })
      }
      var raw = new RawPlugin(plugin, Shared.FrameworkOptions.layers);
      return new Plugin(raw, instanceObjects);

    })
    //.flatten().filter(Boolean).groupBy('layer').value();
    .flatten()
    .filter(Boolean)
    .filter(function(p){
      return p.isEnabled();
    }).value();
  return plugins
};

function attemptLoad(requirePath){
  try {
    debug('Trying stock require . ' + requirePath)
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
    throw e
  }
}