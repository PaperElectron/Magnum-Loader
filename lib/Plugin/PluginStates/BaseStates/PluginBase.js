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

// var ConfigBuilder = require('../../builders/configuration')

/**
 *
 * @module PluginBase
 */

function PluginBase(RawPlugin, FrameworkInjector, DependencyInjector) {
  BaseStates.apply(this, arguments)
  this.Injector = DependencyInjector;
  this.FrameworkInjector = FrameworkInjector;
  this.FrameworkErrors = FrameworkInjector.get('FrameworkErrors');
  this.FrameworkEvents = FrameworkInjector.get('FrameworkEvents');
  // RawPlugin
  this.RawPlugin = RawPlugin;

  this.enabled = true;
  this.Errors = RawPlugin.Errors;

  this.moduleName = RawPlugin.moduleName;
  this.options = RawPlugin.options;
  this.metadata = RawPlugin.metadata;
  // this.plugin = this.hooks = RawPlugin.plugin;
  this.errors = RawPlugin.errors;

  //this needs to be derived
  this.prefix = FrameworkInjector.get('PrefixSelector')(this.moduleName)//FrameworkInjector.get('Options').prefix;

  this.nameGenerator = FrameworkInjector.get('NameGenerator')(this.prefix)
  /**
   * TODO - Need an array of all of the param names to check against these.
   * @author - Jim Bulkowski
   * @date - 7/6/16
   * @time - 2:17 AM
   */

  this.systemPlugin = RawPlugin.systemPlugin;
  this.type = this.metadata.type;
  this.multiple = this.metadata.multiple || false;
  this.declaredName = this.metadata.name;FrameworkInjector.get('NameGenerator')
  this.parentModule = this._generateParentName();
  this.configName = this._generateConfigName();

  this.parentDirectory = FrameworkInjector.get('Options').parentDirectory;
  this.applicationDirectory = FrameworkInjector.get('Options').applicationDirectory;
  this.external = RawPlugin.external;

  this.paramName = this.metadata.param || false;

  this.computedOptions = this._computeConfig(FrameworkInjector.get('Options').pluginSettingsDirectory);
  this.timeout = FrameworkInjector.get('Options').timeout;

  // this can be a ref to to global option  logger?

  this.Logger = FrameworkInjector.get('LoggerBuilder')(FrameworkInjector.get('Logger'), this.configName, FrameworkInjector.get('Output'), FrameworkInjector.get('Output').verbose);
  this.loaded = this.started = this.stopped = false;
  //Add custom errors
  if(this.errors) {
    this.Injector.merge('Errors', this.errors)
  }
}

util.inherits(PluginBase, BaseStates)

PluginBase.prototype.setOutsideDependencies = function(availableParams){
  // Make Our Declared Deps and providers conform unless they are an injectable parameter.
  var self = this;

  //If we have config file specified dependencies, attach them to the pulugin metadata
  // So they will bo considered by the topo sorter
  if(_.isArray(this.computedOptions.additionalDependencies)){
    if(_.isArray(this.metadata.depends)){
      [].push.apply(this.metadata.depends, this.computedOptions.additionalDependencies)
    } else {
      this.metadata.depends = this.computedOptions.additionalDependencies
    }
  }
  this.depends = _.map(this.metadata.depends, function(dep){
    if(_.includes(availableParams, dep)){
      return dep
    }
    return self.nameGenerator(dep)// self.FrameworkInjector.get('NameGenerator')(dep)
  });
  this.provides = _.map(this.metadata.provides, function(dep) {
    if(_.includes(availableParams, dep)){
      return dep
    }
    return self.nameGenerator(dep)// self.FrameworkInjector.get('NameGenerator')(dep)
  });

  this.optional = _.map(this.metadata.optional, function(dep) {
    if(_.includes(availableParams, dep)){
      return dep
    }
    return self.nameGenerator(dep)// self.FrameworkInjector.get('NameGenerator')(dep)
  });

  if(this.paramName && (this.paramName !== this.configName)){
    this.provides.push(this.paramName)
  }
}

PluginBase.prototype.valid = function(loadedModules, availableParams) {
  this.metDepends = this.metDepends ? this.metDepends : this.checkDepends(loadedModules, availableParams)
  return this.RawPlugin.valid && this.metDepends;
}

PluginBase.prototype._handleThen = function(result){
  var nextState = result.transitionTo ? result.transitionTo : 'idle'

  if(result.hasErrors && result.hasErrors()){
    this.outputResults({})
  } else {
    this.outputResults()
  }

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

PluginBase.prototype.checkDepends = function(loadedModules, availableParams){

  var hasDeps = _.intersection(loadedModules, this.depends);
  var hasParams = _.intersection(availableParams, this.depends)
  // console.log(hasParams, hasDeps);

  var metDeps = (hasDeps.length + hasParams.length >= this.depends.length);
  if(!metDeps){
    var missing = _.difference(this.depends, loadedModules);
    var other = _.difference(this.depends, availableParams);
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
  var config;
  if(external){
    this.enabled = (!external.disabled)
    if(!this.enabled){ return false }
  }
  if(this.options) {

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
   * valid configuration properties are "disabled" and additionalDependencies
   */
  if(external){
    config.additionalDependencies = external.additionalDependencies
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
  return this.nameGenerator(this.moduleName)//this.FrameworkInjector.get('NameGenerator')(this.moduleName, this.prefix)
};

exports = module.exports = PluginBase