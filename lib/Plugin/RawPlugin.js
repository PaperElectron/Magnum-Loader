/**
 * @file RawPlugin
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
var RawDependency = require('./RawPluginTypes/Dependency');
var RawOverride = require('./RawPluginTypes/Override');
var RawInstaller = require('./RawPluginTypes/Installer');

/**
 *
 * @module RawPlugin
 */




module.exports = function(plugin, layers){
  var type = plugin && plugin.loaded && plugin.loaded.metadata && plugin.loaded.metadata.type

  if(type === 'override'){
    return new RawOverride(plugin, layers)
  }

  if(type === 'installer'){
    try {
      var f = new RawInstaller(plugin, layers)
    }
    catch(e){
      console.log(f);
      console.log(e.stack);
    }
    return f
  }

  return new RawDependency(plugin, layers)
}