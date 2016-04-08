/**
 * @file Plugin
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
var _ = require('lodash')
var util = require('util');
var InjectableStates = require('../BaseStates/InjectableStates');
var Messages = require('../PluginOutput/InjectableOutput')
var Promise = require('bluebird');

var PluginLogger = require('./../../LoggerBuilder');
var Dependency = require('../Dependency');
/**
 *
 * @module Plugin
 */

function InjectablePlugin(Plugin, Shared){
  InjectableStates.apply(this, arguments)
  this.context = {
    Logger: this.Logger,
    options: this.computedOptions,
    lateError: function(err){
      err.plugin = this;
      Shared.SharedEvents.emit('lateError', err)
    }.bind(this)
    //Chalk: this.Output.chalk
  };

  this.transition('initialize')
  // if(this.valid && this.enabled){
  //   this.Logger.log(' Initialized.')
  // } else if(!this.enabled){
  //   this.Logger.warn(' disabled via config setting.')
  // } else {
  //   this.Logger.error(' Initialized with the following errors.')
  //   _.each(this.Errors, function(err){
  //     this.Logger.error(err.message)
  //   }.bind(this))
  // }

}

util.inherits(InjectablePlugin, InjectableStates);

InjectablePlugin.prototype._runHook = function(hookFn, transition) {
  var self = this;
  return new Promise(function(resolve, reject) {
    var rejected = false;
    var timer = setTimeout(function() {
      rejected = true;
      reject(new Error('Timeout exceeded (' + self.timeout + 'ms) attempting to ' + hookFn + ' ' + self.configName))
    }, self.timeout);

    try {
      return self.hooks[hookFn].call(self.context, function(err) {
        clearTimeout(timer);

        if(self[hookFn + 'ed']) {
          return reject(new self.FrameworkErrors.PluginHookError('Hook already called on this plugin', self.configName, hookFn))
        }
        if(!rejected) {
          if(err) {
            err.plugin = self
            return reject(err)
          }

          self[hookFn + 'ed'] = true;
          resolve(self)
        }
      })
    }
    catch(err){
      err.plugin = self
      reject(err)
    }
  })
};

InjectablePlugin.prototype.loadHook = function() {
  var self = this;
  return new Promise(function(resolve, reject) {

    var rejected = false;
    var timer = setTimeout(function() {
      rejected = true;
      reject(new Error('Timeout exceeded (' + self.timeout + 'ms) attempting to load ' + self.configName))
    }, self.timeout);

    try {
      return self.hooks.load.call(self.context, self.Injector.inject.bind(self.Injector), function(err, toInject) {
        clearTimeout(timer);

        if(self.loaded){
          return reject(new self.FrameworkErrors.PluginHookError('Hook already called on this plugin', self.configName, 'load'))
        }

        if(!rejected) {
          if(err) {
            err.plugin = self
            return reject(err)
          }
          try {
            self.setDependencies(toInject)
          }
          catch (err) {
            err.plugin = self
            reject(err)
          }
          self.loaded = true;
          resolve({transitionTo: 'dependency'})
        }
      })
    }
    catch(err){
      err.plugin = self
      reject(err)
    }

  })
};

InjectablePlugin.prototype.startHook = function() {
  return this._runHook('start')
};

InjectablePlugin.prototype.stopHook = function() {
  return this._runHook('stop')
};

InjectablePlugin.prototype.injectHook = function() {
  return new Promise(function(resolve, reject) {
    if(!this.dependencies){
      return resolve(this)
    };
    var self = this;

    if(this.dependenciesAreArray()){
      _.each(this.dependencies, function(dep, i, c) {
        dep.inject(self.Injector);
      })
      //return this.dependencies
    } else {
      this.dependencies = this.dependencies.inject(this.Injector);
    }
    //Log out any issues.

    // this.Logger.log(self.getDepNames() + ' Added to Injector');
    resolve(this)
  }.bind(this))

};

module.exports = InjectablePlugin