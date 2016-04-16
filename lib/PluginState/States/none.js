/**
 * @file none
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
var _ = require('lodash');
var Promise = require('bluebird')
/**
 *
 * @module none
 */

module.exports = {

  install: function() {
    return Promise.resolve(this)
  },

  load: function() {
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

            self.loaded = true;
            resolve(self)
          }
        })
      }
      catch(err){
        err.plugin = self
        return reject(err)
      }

    })
  },

  start: function() {
    return runHook.call(this, 'start')
  },
  stop: function() {
    return runHook.call(this, 'stop')
  }
}

function runHook(hookFn, transition) {
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