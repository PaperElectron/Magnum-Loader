/**
 * @file PluginValidators
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
var _ = require('lodash');
/**
 * Validates plugin metadata and hook methods.
 * @module PluginValidators
 */

exports.hookMethods = function(plugin){
  var methods = ['load', 'start', 'stop'];
  if(!plugin){
    throw new Error('Not a valid plugin')
  }
  var valid = _.chain(methods)
    .map(function(v) {
      return _.isFunction(plugin[v])
    })
    .every(Boolean)
    .value()
  if(valid){
    return plugin
  }
  throw new Error('Plugin missing hook methods.')
}

exports.metadata = function(metadata){
  if(!metadata){
    throw new Error('Invalid metadata.')
  }
  return metadata
}

exports.humanName = function(moduleName){
  if(!moduleName){
    throw new Error('No module name.')
  }
  return moduleName.substr(moduleName.indexOf('-') + 1).replace('-', '_');
}