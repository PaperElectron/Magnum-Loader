/**
 * @file ModuleContainer
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http =//opensource.org/licenses/MIT}
 */

'use strict';
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var availableTypes = ['factory', 'service', 'instance', 'merge'];

/**
 *
 * @module ModuleContainer
 */

function Container(loaded, pluginOptions, Shared) {
  validArgs(arguments)

  try {
    var humanName = validHumanName(loaded.moduleName);
    var metadata = validMetadata(loaded.loaded.metadata);
    var hooks = validHookMethods(loaded.loaded.plugin);
  }
  catch (e) {
    var details = 'Plugin ' + loaded.moduleName + ' could not load. ' + e.message + '.'
    e.message = details
    throw e
  }

  this.external = loaded.external;
  this.multiple = metadata.multiple || false;
  this.layer = metadata.layer;
  this.type = metadata.type;
  this.humanLayer = metadata.layer.charAt(0).toUpperCase() + metadata.layer.slice(1);
  this.humanName = humanName
  this.declaredName = metadata.name || this.humanName;
  this.injectName = metadata.inject || false;
  this.moduleName = loaded.moduleName;
  this.exportedErrors = loaded.loaded.errors || null;
  this.defaultOptions = loaded.loaded.defaults || false;
  this.computedOptions = buildConfig(Shared.ParentDirectory, this.defaultOptions, pluginOptions[this.humanName])
  this.hooks = hooks;
  this.errors = validErrors(loaded.loaded.errors)
}

module.exports = Container;



/**
 * Validates plugin metadata and hook methods.
 * @module PluginValidators
 */

function validArgs(args){
  if(args.length < 3){
    throw new Error('Plugin requires 3 arguments.')
  }
}

function validHookMethods(plugin){
  var methods = ['load', 'start', 'stop'];
  if(!plugin){
    throw new Error('Does not contain a plugin property')
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
  throw new Error('Missing hook methods')
}

function validMetadata(metadata){
  if(!metadata){
    throw new Error('Metadata missing or invalid');
  }
  return metadata
}

function validType(type){
  if( _.includes(availableTypes, type) ) return type;
  return 'service'
}

function validHumanName(moduleName){
    if(!moduleName){
      throw new Error('No module name')
    }
    return moduleName.substr(moduleName.indexOf('-') + 1).replace('-', '_');
  }

function validErrors(errorObjs){
  if(_.isObject(errorObjs)) {
    var e = _.pick(errorObjs, function(err) {
      return (err.prototype && err.prototype.name === 'Error')
    });
    return e
  }
  return false
}

function buildConfig(parentPath, defaults, config){
  if(defaults){
    config = _.merge(defaults, config);
    var workDir = config.workDir;
    if(workDir){
      try {
        var absoluteWorkdir = path.join(parentPath, workDir)
        var stats = fs.statSync(absoluteWorkdir)
        if(stats.isDirectory()){
          config.workDir = absoluteWorkdir;
        }
      }
      catch(e){
        throw e
      }
    }
  }

  return config || {}
}