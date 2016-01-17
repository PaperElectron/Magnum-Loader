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
var availableTypes = ['factory', 'service', 'instance', 'merge', 'dynamic', 'none'];

/**
 *
 * @module ModuleContainer
 */

function PluginBase(loaded, pluginOptions, Shared) {
  validArgs(arguments)

  try {
    var configName = validConfigName(loaded.moduleName, Shared.FrameworkOptions.prefix);
    var metadata = validMetadata(loaded.loaded.metadata);
    var declaredName = validDeclaredName(metadata.name);
    var layer = validLayer(metadata.layer, Shared.FrameworkOptions.layers)
    var type = validType(metadata.type);
    var hooks = validHookMethods(loaded.loaded.plugin);
  }
  catch (e) {
    var details = 'Plugin ' + loaded.moduleName + ' could not load. ' + e.message + '.';
    e.message = details
    throw e
  }

  this.parentDirectoryPath = Shared.FrameworkOptions.parentDirectory;
  this.external = loaded.external;
  this.multiple = metadata.multiple || false;
  this.layer = layer;
  this.humanLayer = layer.charAt(0).toUpperCase() + layer.slice(1);
  this.type = type;
  this.configName = configName;
  this.declaredName = declaredName;
  this.injectName = metadata.inject || false;
  this.moduleName = loaded.moduleName;
  this.defaultOptions = loaded.loaded.options || false;
  this.computedOptions = this._buildConfig(pluginOptions);
  this.hooks = hooks;
  this.errors = validErrors(loaded.loaded.errors)
}

PluginBase.prototype.getDefaultConfig = function(){
  if(this.defaultOptions) {
    var o = {};
    o[this.configName] = this.defaultOptions;
    return o
  }
  return false
};

PluginBase.prototype.getComputedConfig = function(){
  if(this.computedOptions) {
    var o = {};
    o[this.configName] = this.computedOptions;
    return o
  }
  return false
};

PluginBase.prototype._buildConfig = function(pluginOptions){
  if(this.defaultOptions) {
    var config = _.merge(_.clone(this.defaultOptions), pluginOptions[this.configName]);
    var workDir = config.workDir;
    if(workDir) {
      try {
        var absoluteWorkdir = path.join(this.parentDirectoryPath, workDir)
        var stats = fs.statSync(absoluteWorkdir)
        if(stats.isDirectory()) {
          config.workDir = absoluteWorkdir;
        }
        else {
          throw new Error(absoluteWorkdir + ' is not a directory.')
        }
      }
      catch (e) {
        e.message = 'Plugin ' + this.configName + ' : ' + e.message
        throw e
      }
    }
  }
  return config || false
}

exports = module.exports = PluginBase;
exports.validConfigName = validConfigName;

/**
 * Validates plugin metadata and hook methods.
 * @module PluginValidators
 */

function validArgs(args) {
  if(args.length < 3) {
    throw new Error('Plugin requires 3 arguments.')
  }
}

function validDeclaredName(name) {
  if(!name) {
    throw new Error('metadata.name missing')
  }
  return name
}

function validLayer(layer, layers) {
  if(!layer) {
    throw new Error('metadata.layer missing')
  }
  if(_.includes(layers, layer)) {
    return layer
  }
  throw new Error('metadata.layer "' + layer + '" not in the list of available layers')
}

function validHookMethods(plugin) {
  var methods = ['load', 'start', 'stop'];
  if(!plugin) {
    throw new Error('Does not contain a plugin property')
  }
  var valid = _.chain(methods)
    .map(function(v) {
      return _.isFunction(plugin[v])
    })
    .every(Boolean)
    .value()
  if(valid) {
    return plugin
  }
  throw new Error('Missing hook methods')
}

function validMetadata(metadata) {
  if(!metadata) {
    throw new Error('Metadata missing or invalid');
  }
  return metadata
}

function validType(type) {
  if(!type) {
    throw new Error('metadata.type missing, must be one of the following ' + availableTypes.join(', '))
  }
  if(!_.includes(availableTypes, type)) {
    throw new Error('metadata.type "' + type + '" must be one of the following ' + availableTypes.join(', '))
  }
  return type
}

function validConfigName(moduleName, prefix) {
  var prefix = prefix + '-'
  if(!moduleName) {
    throw new Error('No module name')
  }

  var splitModuleName = moduleName.split(prefix, 2);
  var validConfigName;

  if(!splitModuleName[0]) {
    validConfigName = splitModuleName[1].replace('-', '_')
  } else {
    validConfigName = splitModuleName[0].replace('-', '_')
  }

  return validConfigName
}

function validErrors(errorObjs) {
  if(_.isObject(errorObjs)) {
    var e = _.pick(errorObjs, function(err) {
      return (err.prototype && err.prototype.name === 'Error')
    });
    return e
  }
  return false
}
