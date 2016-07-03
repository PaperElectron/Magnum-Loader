/**
 * @file PluginBase
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';

var _ = require('lodash')
var util = require('util');
var BaseStates = require('./BaseStates');
// var PluginLogger = require('./../../LoggerBuilder');
var Dependency = require('../../Dependency');
var Promise = require('bluebird');
var path = require('path');
var fs = require('fs');

/**
 *
 * @module PluginBase
 */

function PluginBase(RawPlugin, Shared) {
  BaseStates.apply(this, arguments)
  this.Injector = Shared.Injector;
  this.FrameworkInjector = Shared.FrameworkInjector;
  this.FrameworkErrors = Shared.FrameworkErrors;
  // RawPlugin
  this.RawPlugin = RawPlugin;

  this.enabled = true;
  this.Errors = RawPlugin.Errors;

  this.moduleName = RawPlugin.moduleName;
  this.options = RawPlugin.options;
  this.metadata = RawPlugin.metadata;
  // this.plugin = this.hooks = RawPlugin.plugin;
  this.errors = RawPlugin.errors;
  this.prefix = Shared.FrameworkOptions.prefix;

  // Make Our Declared Deps and providers conform.
  this.depends = _.map(RawPlugin.metadata.depends, function(dep){
    return Shared.FrameworkInjector.get('NameGenerator')(dep)
  });
  this.provides = _.map(RawPlugin.metadata.provides, function(dep) {
    return Shared.FrameworkInjector.get('NameGenerator')(dep)
  });

  this.optional = _.map(RawPlugin.metadata.optional, function(dep) {
    return Shared.FrameworkInjector.get('NameGenerator')(dep)
  });

  this.systemPlugin = RawPlugin.systemPlugin;
  this.type = this.metadata.type;
  this.multiple = this.metadata.multiple || false;
  this.declaredName = this.metadata.name;
  this.parentModule = this._generateParentName();
  this.configName = this._generateConfigName();

  this.parentDirectory = Shared.FrameworkOptions.parentDirectory;
  this.applicationDirectory = Shared.FrameworkOptions.applicationDirectory;
  this.external = RawPlugin.external;

  this.paramName = this.metadata.param || false;
  if(this.paramName && (this.paramName !== this.configName)){
    this.provides.push(this.paramName)
  }

  this.computedOptions = this._computeConfig(Shared.FrameworkOptions.pluginSettingsDirectory);

  this.timeout = Shared.FrameworkOptions.timeout;
  this.Logger = this.FrameworkInjector.get('LoggerBuilder')(Shared.Logger, this.configName, Shared.Output, Shared.Output.verbose);
  this.loaded = this.started = this.stopped = false;
  //Add custom errors
  if(this.errors) {
    this.Injector.merge('Errors', this.errors)
  }
}

util.inherits(PluginBase, BaseStates)

PluginBase.prototype.valid = function() {
  this.metDepends = this.metDepends ? this.metDepends : this.checkDepends(this.FrameworkInjector.get('LoadedModuleNames'))
  return this.RawPlugin.valid && this.metDepends;
}

PluginBase.prototype._handleThen = function(result){
  var nextState = result.transitionTo ? result.transitionTo : 'idle'
  this.outputResults()
  return this.transition(nextState)
}

PluginBase.prototype._handleCatch = function(error){
  this.addError(error)
  this.outputResults(error)
  return this.transition('error')
}

/**
 * Returns formatted string built from the array of loaded dependencies.
 *
 * @returns {string}
 */
PluginBase.prototype.getDepNames = function() {
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

PluginBase.prototype.overrideHooks = function(hooks){
  this.hooks = hooks
};

/**
 * Creates dependency objects returned by this plugin and adds them to the injector.
 *
 * @param Dependencies The reference to the parent injector.
 */
PluginBase.prototype.setDependencies = function(Dependencies) {
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
PluginBase.prototype.dependenciesAreArray = function() {
  return _.isArray(this.dependencies)
};

PluginBase.prototype.depNames = function(){
  return {name: this.declaredName, deps: this.dependencies}
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
  return this.FrameworkInjector.get('NameGenerator')(this.moduleName, this.prefix)
};

exports = module.exports = PluginBase