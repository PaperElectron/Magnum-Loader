/**
 * @file Installer
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
var _ = require('lodash');
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs-extra'));
var path = require('path');

/**
 *
 * @module Installer
 */
module.exports = {
  install: function() {
    var installTargets = Promise.map(this.installFiles, function(fileObj){

      var expectedWorkDirObj = this.getWorkDirs()[fileObj.to]

      var expectedWorkDir = this.getWorkDirs()[fileObj.to].workDir;
      var expectedOutput = path.join(expectedWorkDir,fileObj.dest);
      return fs.statAsync(expectedWorkDir)
        .bind(this)
        .then(function(stats){
          if(stats.isDirectory()){
            return fs.statAsync(expectedOutput)
          }
          throw new Error('Target installation work directory does not exist.')
        })
        .then(function(stats){
          if(stats.isDirectory() || stats.isFile()){
            this.Logger.log('Installation target ' + fileObj.dest+ ' for ' + fileObj.to +' exists, skipping.');
            return false
          }
          return fileObj
        })
        .catch(function(err){
          if(err.code === 'ENOENT'){
            this.Logger.log('Installing '+ fileObj.to + ' files to work directory destination  ' + fileObj.dest);
            return fs.copyAsync(fileObj.src, path.join(expectedWorkDir,fileObj.dest))
          }
          throw err
        })

    }.bind(this));

    return installTargets
      .then(function(results){
        return {transitionTo: 'idle'}
      })
  },

  load: function() {
    var self = this;
    return new Promise(function(resolve, reject) {
      var rejected = false;

      var timer = setTimeout(function() {
        rejected = true;
        reject(new Error('Timeout exceeded (' + self.timeout + 'ms) attempting to install ' + self.configName))
      }, self.timeout);

      try {
        return self.hooks.installer.call(self.context, {}, function(err, installFiles) {
          clearTimeout(timer);
          if(self.stopped) {
            return reject(new self.FrameworkErrors.PluginHookError('Hook already called on this plugin', self.configName, 'stop'))
          }

          if(!rejected) {
            if(err) {
              err.plugin = self;
              return reject(err)
            }
            self.loaded = true;
            self.installFiles = installFiles;
            resolve({transitionTo: 'install'})
          }
        })
      }
      catch(e){
        reject(e)
      }
    })
  },

  start: function() {
    return runHook.call(this, 'start')
  },
  stop: function() {
    return runHook.call(this, 'stop')
  }
};

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
            err.plugin = self;
            return reject(err)
          }

          self[hookFn + 'ed'] = true;
          resolve(self)
        }
      })
    }
    catch(err){
      err.plugin = self;
      reject(err)
    }
  })
}