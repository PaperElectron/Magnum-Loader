/**
 * @file new_PluginBase
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
var _ = require('lodash');
var path = require('path');
var fs = require('fs');
var util = require('util');

function PluginBase(RawPlugin, pluginOptions, Shared) {
  // RawPlugin
  this.RawPlugin = RawPlugin;
  this.valid = RawPlugin.valid;
  this.Errors = RawPlugin.Errors;

  this.moduleName = RawPlugin.moduleName;
  this.options = RawPlugin.options;
  this.metadata = RawPlugin.metadata;
  this.plugin = this.hooks = RawPlugin.plugin;
  this.errors = RawPlugin.errors;
  this.prefix = Shared.FrameworkOptions.prefix;

  this.layer = this.metadata.layer;
  this.type = this.metadata.type;
  this.multiple = this.metadata.multiple || false;
  this.declaredName = this.metadata.name;
  this.parentModule = this._generateParentName();
  this.configName = this._generateConfigName();

  this.parentDirectoryPath = Shared.FrameworkOptions.parentDirectory;
  this.external = RawPlugin.external;
  this.multiple = this.metadata.multiple || false;
  this.humanLayer = this.layer.charAt(0).toUpperCase() + this.layer.slice(1);

  this.paramName = this.metadata.param || false;

  this.computedOptions = this._computeConfig(pluginOptions);
}

PluginBase.prototype.hasErrors = function(){
  return !!(this.Errors.length);
};

PluginBase.prototype.getErrors = function(){
  return {
    moduleName: this.moduleName,
    Errors: this.Errors
  }
};

PluginBase.prototype.getDefaultConfig = function(){
  if(this.options) {
    var o = {};
    if(this.multiple){
      o[this.parentModule] = {};
      o[this.parentModule][this.configName] = this.options
    } else {
      o[this.configName] = this.options;
    }
    return o
  }
  return false
};

PluginBase.prototype.getComputedConfig = function(){
  if(this.computedOptions) {
    var o = {};
    if(this.multiple){
      o[this.parentModule] = {};
      o[this.parentModule][this.configName] = this.computedOptions;
    } else {
      o[this.configName] = this.computedOptions;
    }
    return o
  }
  return false
};

PluginBase.prototype._computeConfig = function(pluginOptions){
  if(this.options) {
    var config
    if(this.multiple){
      if(_.isObject(pluginOptions[this.parentModule])){
        config = _.merge(_.clone(this.options), pluginOptions[this.parentModule][this.configName]);
      } else {
        config = _.clone(this.options)
      }
    } else {
      config = _.merge(_.clone(this.options), pluginOptions[this.configName]);
    }

    var workDir = config.workDir;
    if(workDir) {
      var absoluteWorkdir = path.join(this.parentDirectoryPath, workDir);
      try {
        var stats = fs.statSync(absoluteWorkdir)
      }
      catch(e){
        this.valid = false;
        this.Errors.push(e);
        return false
      }
      if(stats.isDirectory()) {
        config.workDir = absoluteWorkdir;
      } else {
        this.valid = false;
        this.Errors.push(new Error(absoluteWorkdir + ' is not a directory.'));
        return false
      }
    }
  }
  return config || false
};

PluginBase.prototype._generateConfigName = function(){
  var prefix = this.prefix + '-';
  var splitModuleName = this.moduleName.split(prefix, 2);
  var validConfigName;

  if(!splitModuleName[0]) {
    validConfigName = splitModuleName[1].replace('-', '_')
  } else {
    validConfigName = splitModuleName[0].replace('-', '_')
  }

  if(this.multiple){
    return this.metadata.name
  }
  return this._generateParentName()
};

PluginBase.prototype._generateParentName = function(){
  var prefix = this.prefix + '-';
  var splitModuleName = this.moduleName.split(prefix, 2);
  var validConfigName;

  if(!splitModuleName[0]) {
    validConfigName = splitModuleName[1].replace('-', '_')
  } else {
    validConfigName = splitModuleName[0].replace('-', '_')
  }

  return validConfigName
};

exports = module.exports = PluginBase;
exports.validConfigName = validConfigName;

/**
 * Validates plugin metadata and hook methods.
 * @module PluginValidators
 */

function validConfigName(moduleName, prefix) {
  var prefix = prefix + '-';
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


