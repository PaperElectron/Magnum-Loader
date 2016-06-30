/**
 * @file RawPlugin
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
var RawDependency = require('./Types/Dependency');
var RawOverride = require('./Types/Override');
var RawInstaller = require('./Types/Installer');

/**
 *
 * @module RawPlugin
 */




module.exports = function(plugin){
  var type = plugin && plugin.loaded && plugin.loaded.metadata && plugin.loaded.metadata.type
  if(type === 'override'){
    return new RawOverride(plugin)
  }

  if(type === 'installer'){
    try {
      var f = new RawInstaller(plugin)
    }
    catch(e){
      console.log(f);
      console.log(e.stack);
    }
    return f
  }

  return new RawDependency(plugin)
}