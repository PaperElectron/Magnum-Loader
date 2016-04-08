/**
 * @file DependencyStates
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
var _ = require('lodash')
var util = require('util');
var BaseStates = require('./BaseStates');
var PluginLogger = require('./../../LoggerBuilder');
var Dependency = require('../Dependency');
var Promise = require('bluebird');
var path = require('path');
var fs = require('fs');
/**
 *
 * @module DependencyStates
 */

function InjectableStates(RawPlugin, Shared) {
  BaseStates.apply(this, arguments)
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

  this.timeout = Shared.FrameworkOptions.timeout;
  this.Logger = PluginLogger(Shared.Logger, this.configName, Shared.Output, Shared.Output.verbose);
  this.loaded = this.started = this.stopped = false;

  //Add custom errors
  if(this.errors) {
    this.Injector.merge('Errors', this.errors)
  }
}

util.inherits(InjectableStates, BaseStates)


InjectableStates.prototype._handleThen = function(result){
  var nextState = result.transitionTo ? result.transitionTo : 'idle'
  this.outputResults()
  return this.transition(nextState)
}

InjectableStates.prototype._handleCatch = function(error){
  this.addError(error)
  this.outputResults(error)
  return this.transition('error')
}

/**
 * States
 */
InjectableStates.prototype.initialize = function() {
  this.outputResults()
  return this.transition('idle')
}

InjectableStates.prototype.dependency = function() {
  this.outputResults()
  return this.transition('idle')
}

InjectableStates.prototype.injectdeps = function() {
  return this.injectHook()
    .bind(this)
    .then(this._handleThen)
    .catch(this._handleCatch)
}

InjectableStates.prototype.load = function() {
  return this.loadHook()
    .bind(this)
    .then(this._handleThen)
    .catch(this._handleCatch)
}

InjectableStates.prototype.start = function() {
  return this.startHook()
    .bind(this)
    .then(this._handleThen)
    .catch(this._handleCatch)
}

InjectableStates.prototype.stop = function() {
  return this.stopHook()
    .bind(this)
    .then(this._handleThen)
    .catch(this._handleCatch)
}

InjectableStates.prototype.idle = function() {
  this.outputResults()
  return Promise.resolve(this)
}

InjectableStates.prototype.error = function() {
  return new Promise(function(resolve, reject) {
    this.outputResults()
    setTimeout(function() {
      resolve(this.transition('idle'))
    }.bind(this), 100)
  }.bind(this))
}

/**
 * Returns formatted string built from the array of loaded dependencies.
 *
 * @returns {string}
 */
InjectableStates.prototype.getDepNames = function() {
  if(this.dependenciesAreArray()){
    return _.map(this.dependencies, function(d) {
      return d.name
    }).join(', ')
  }
  if(this.dependencies){
    return this.dependencies.name
  }
  return ''
};

/**
 * Creates dependency objects returned by this plugin and adds them to the injector.
 *
 * @param Dependencies The reference to the parent injector.
 */
InjectableStates.prototype.setDependencies = function(Dependencies) {
  var self = this;
  if(!Dependencies) return;

  if(_.isArray(Dependencies)) {
    this.dependencies = _.map(Dependencies, function(dep) {
      return new Dependency(self.configName, dep.param, dep.load, dep.type, self.FrameworkErrors)
    });
    return
  }

  this.dependencies = new Dependency(this.configName, this.paramName, Dependencies, this.type, this.FrameworkErrors);
};

/**
 * Is the current dependencies object an Array
 *
 * @returns {Boolean}
 */
InjectableStates.prototype.dependenciesAreArray = function() {
  return _.isArray(this.dependencies)
};

InjectableStates.prototype.depNames = function(){
  return {name: this.declaredName, deps: this.dependencies}
}

InjectableStates.prototype.checkDepends = function(loadedModules){
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

InjectableStates.prototype.isEnabled = function(){
  return this.enabled
}

InjectableStates.prototype.hasErrors = function(){
  return !!(this.Errors.length);
};

InjectableStates.prototype.getErrors = function(){
  return {
    moduleName: this.moduleName,
    Errors: this.Errors
  }
};

InjectableStates.prototype.getDefaultConfig = function(){
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

InjectableStates.prototype.getComputedConfig = function(){
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

InjectableStates.prototype._getExternalOptions = function(pluginSettings){
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

InjectableStates.prototype._computeConfig = function(pluginSettings){
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

InjectableStates.prototype.getComputedDirectory = function() {
  return this.computedOptions && this.computedOptions.workDir
}

InjectableStates.prototype._generateConfigName = function(){
  if(this.multiple){
    return this.metadata.name
  }
  return this._generateParentName()
};

InjectableStates.prototype._generateParentName = function(){
  var formattedName = _.upperFirst(_.camelCase(_.replace(this.moduleName, this.prefix, '')));
  return formattedName
};

exports = module.exports = InjectableStates
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