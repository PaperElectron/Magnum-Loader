/**
 * @file nonePlugin
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';

var _ = require('lodash')
var util = require('util');
var InjectablePlugin = require('./BaseInjectablePlugin');
var Messages = require('../PluginOutput/NoneOutput')
var Promise = require('bluebird');

/**
 *
 * @module nonePlugin
 */

function NonePlugin(Plugin, Shared){
  this.stateMessage = new Messages(this)
  InjectablePlugin.apply(this, arguments)
}

util.inherits(NonePlugin, InjectablePlugin);

NonePlugin.prototype.loadHook = function() {
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
          resolve({transitionTo: 'idle'})
        }
      })
    }
    catch(err){
      err.plugin = self
      reject(err)
    }

  })
};

module.exports = NonePlugin