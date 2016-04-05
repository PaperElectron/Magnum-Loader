/**
 * @file Plugin
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
var _ = require('lodash');
var Promise = require('bluebird');
var PluginLogger = require('./../../LoggerBuilder');
var PluginBase = require('./PluginCommon');
var util = require('util');
/**
 * Provides an interface to interact with loaded plugins.
 * @module Plugin
 */

function Plugin(plugin, Shared) {
  PluginBase.apply(this, arguments);
  this.Output = Shared.Output;
  this.timeout = Shared.FrameworkOptions.timeout;
  this.Logger = PluginLogger(Shared.Logger, this.configName, Shared.Output, Shared.Output.verbose);
  this.loaded = this.started = this.stopped = false;

  this.installer = plugin.installer || false;
  this.context = {
    Logger: this.Logger,
    options: this.computedOptions,
    lateError: function(err){
      err.plugin = this;
      Shared.SharedEvents.emit('lateError', err)
    }.bind(this)
    //Chalk: this.Output.chalk
  };
  //Add custom errors
  if(this.errors) {
    this.Injector.merge('Errors', this.errors)
  }

  if(this.valid && this.enabled){
    this.Logger.log(this.humanLayer + ' Plugin ' + this.configName + ' Initialized.')
  } else if(!this.enabled){
    this.Logger.warn(this.humanLayer + ' Plugin ' + this.configName + ' disabled via config setting.')
  } else {
    this.Logger.error(this.humanLayer + ' Plugin ' + this.configName + ' Initialized with the following errors.')
    _.each(this.Errors, function(err){
      this.Logger.error(err.message)
    }.bind(this))
  }

}

util.inherits(Plugin, PluginBase);


Plugin.prototype.install = function() {
  var self = this;
  return new Promise(function(resolve, reject) {
    var rejected = false;

    var timer = setTimeout(function() {
      rejected = true;
      reject(new Error('Timeout exceeded (' + self.timeout + 'ms) attempting to install ' + self.configName))
    }, self.timeout);

    try {
      return self.installer.call(self.context, {},function(err) {
        console.log('DDDDDD');
        clearTimeout(timer);

        if(self.stopped) {
          return reject(new self.FrameworkErrors.PluginHookError('Hook already called on this plugin', self.configName, 'stop'))
        }

        if(!rejected) {
          if(err) {
            err.plugin = self
            return reject(err)
          }
          self.stopped = true;
          self.Logger.log('Installed ' +self.configName+ ' with no errors.');
          resolve(self)
        }
      })
    }
    catch(e){
      reject(e)
    }
  })
    .catch(function(err){
      err.plugin = self;
      throw err
    })
};

module.exports = Plugin;