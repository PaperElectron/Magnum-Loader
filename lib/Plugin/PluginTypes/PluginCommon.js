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

function PluginBase(RawPlugin, Shared) {
  this.Injector = Shared.Injector;
  this.FrameworkErrors = Shared.FrameworkErrors;
  // RawPlugin
  this.RawPlugin = RawPlugin;
  this.valid = RawPlugin.valid;
  this.enabled = true;
  this.Errors = RawPlugin.Errors;

  this.moduleName = RawPlugin.moduleName;
  this.options = RawPlugin.options;
  this.metadata = RawPlugin.metadata;
  this.plugin = this.hooks = RawPlugin.plugin;
  this.errors = RawPlugin.errors;
  this.prefix = Shared.FrameworkOptions.prefix;
  this.depends = RawPlugin.metadata.depends || [];

  this.layer = this.metadata.layer;
  this.type = this.metadata.type;
  this.multiple = this.metadata.multiple || false;
  this.declaredName = this.metadata.name;
  this.parentModule = this._generateParentName();
  this.configName = this._generateConfigName();

  this.parentDirectory = Shared.FrameworkOptions.parentDirectory;
  this.applicationDirectory = Shared.FrameworkOptions.applicationDirectory;
  this.external = RawPlugin.external;
  this.multiple = this.metadata.multiple || false;
  this.humanLayer = this.layer.charAt(0).toUpperCase() + this.layer.slice(1);

  this.paramName = this.metadata.param || false;

  this.computedOptions = this._computeConfig(Shared.FrameworkOptions.pluginSettingsDirectory);
}

PluginBase.prototype.checkDepends = function(loadedModules){
  var hasDeps = _.intersection(loadedModules, this.depends);
  var metDeps = (hasDeps.length === this.depends.length);
  if(!metDeps){
    var missing = _.difference(this.depends, loadedModules);
    var message = 'Unmet outside dependencies. \n' +
      'This plugin requires the following additional plugins to function \n' +
      missing.join(', ');
    this.Errors.push(new this.FrameworkErrors.PluginConstructionError(message, this.moduleName))
  }
  return metDeps
}

PluginBase.prototype.isEnabled = function(){
  return this.enabled
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

PluginBase.prototype._getExternalOptions = function(pluginSettings){
  var self = this;
  var ExternalOptions;
  if(pluginSettings.path){
    var configName = this.multiple ? this.parentModule : this.configName;
    var settingMatch = _.some(pluginSettings.files,function(file){
      return file === configName
    })

    if(settingMatch){
      var settingsThing = require(path.join(pluginSettings.path, configName))
      var loadedOptionsThing  = settingsThing[configName];
      if(_.isFunction(loadedOptionsThing)){
        loadedOptionsThing = this.Injector.inject(loadedOptionsThing);
      }
      if(this.multiple) {
          return loadedOptionsThing[this.configName] || false
      }
      return loadedOptionsThing
    }
  }

  return false;

};

PluginBase.prototype._computeConfig = function(pluginSettings){
  var external = this._getExternalOptions(pluginSettings);
  if(external){
    this.enabled = (!external.disabled)
    if(!this.enabled){ return false }
  }
  if(this.options) {
    var config;
    // Override defaults if external options are set for this plugin.
    var clonedOptions = _.cloneDeep(this.options);
    if(external){
      // replace default configs with external config values if present.
      // Trying to use _.merge here breaks on arrays.
      config = _.mapValues(clonedOptions, function(v, k){
        //TODO: maybe put a validator on this to match type.
        if(external[k]){
          return external[k]
        }
        return v
      })
    } else {
      config = clonedOptions;
    }

    var workDir = config.workDir;
    if(workDir) {
      var absoluteWorkdir = path.join(this.applicationDirectory, workDir);
      try {
        var stats = fs.statSync(absoluteWorkdir)
      }
      catch(err){
        this.valid = false;
        var e = new this.FrameworkErrors.PluginConstructionError(err.message, this.configName)
        this.Errors.push(e);
        return false
      }
      if(stats.isDirectory()) {
        config.workDir = absoluteWorkdir;
      } else {
        this.valid = false;
        var e = new this.FrameworkErrors.PluginConstructionError(absoluteWorkdir + ' is not a directory.', this.configName)
        this.Errors.push(e);
        return false
      }
    }
  }

  /*
   * If there is an external config for this plugin, but no default options the only
   * valid configuration property is "disabled"
   */

  if(external){
    this.enabled = (!external.disabled)
  }

  return config || false
};

PluginBase.prototype.getComputedDirectory = function() {
  return this.computedOptions && this.computedOptions.workDir
}

PluginBase.prototype._generateConfigName = function(){
  if(this.multiple){
    return this.metadata.name
  }
  return this._generateParentName()
};

PluginBase.prototype._generateParentName = function(){
  var formattedName = _.upperFirst(_.camelCase(_.replace(this.moduleName, this.prefix, '')));
  return formattedName
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


