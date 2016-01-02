/**
 * @file ModuleContainer
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
var Validate = require('./PluginValidators');

/**
 *
 * @module ModuleContainer
 */

function Container(loaded){
  try{
    var metadata = Validate.metadata(loaded.loaded.metadata)
    return {
      external: loaded.external || false,
      multiple: metadata.multiple || false,
      layer: metadata.layer,
      declaredName: metadata.name,
      injectName: metadata.inject || false,
      moduleName: Validate.humanName(loaded.moduleName),
      exportedErrors: loaded.loaded.errors || null,
      defaultOptions: loaded.loaded.defaults || false,
      hooks: Validate.hookMethods(loaded.loaded.plugin),
    }
  }
  catch(e){
    console.log(e)
  }

}

module.exports = Container