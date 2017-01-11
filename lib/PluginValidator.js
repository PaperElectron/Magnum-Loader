/**
 * @file PluginValidator
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project magnum-loader-2
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

"use strict";

const RawPlugin = require('./RawPlugin');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const debug = require('debug')('magnum-loader:pluginValidator');

module.exports = function(pluginData, FrameworkInjector){
  let Options = FrameworkInjector.get('Options')
  let Output = FrameworkInjector.get('Output')
  let FrameworkLogger = FrameworkInjector.get('FrameworkLogger')
  FrameworkLogger.log(Output.titleAnnounce(`Requiring ${pluginData.length} Plugin modules.`));

  let ValidatedPlugins = _.chain(pluginData)
    .map(function(plugin){
      let loadedPlugin = attemptLoad(plugin.require);
      plugin.loaded = loadedPlugin;
      //refactor this to be a recursive call that allows multiple plugin modules to export
      //Other multiple plugin modules.

      return unrollPlugin(plugin)
    })
    .flattenDeep()
    .filter(Boolean)
    .value()

  return ValidatedPlugins
}


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

/**
 * Creates arrays of plugins from multiple plugin modules.
 * @param plugin
 * @param layers
 * @returns {Array|TResult[]|boolean[]}
 */
function unrollPlugin(plugin, layers){

  if(_.isArray(plugin.loaded)){
    var overrideName = _.chain(plugin.loaded).remove(function(pin){
      return _.isString(pin)
    }).first().value()

    return _.map(plugin.loaded, function(mPlugin){

      if(overrideName){
        plugin.moduleName = overrideName
      }

      var multiplePlugin = _.chain(plugin).clone().omit('loaded').value();
      multiplePlugin.loaded = mPlugin;
      if(!multiplePlugin.loaded.metadata) {
        multiplePlugin.loaded.metadata = {}
      }
      multiplePlugin.loaded.metadata.multiple = true;

      //TODO: Where is this even used?
      // multiplePlugin.loaded.metadata.declaredName = multiplePlugin.loaded.metadata.name;

      return unrollPlugin(multiplePlugin, layers)
    })
  }
  return RawPlugin(plugin, layers);
}