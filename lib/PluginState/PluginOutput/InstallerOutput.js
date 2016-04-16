/**
 * @file InstallerOutput
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';

var _ = require('lodash');
var outputUtils = require('./OutputUtils');
/**
 *
 * @module InstallerOutput
 */

function InstallerOutput(self){
  return {
    ok: {
      initialize: function(){
        if(self.valid && self.enabled){
          return {action: 'log', msg: 'Initialized as ' + self.type + ' plugin'}
        } else if(!self.enabled){
          return {action: 'warn', msg: 'disabled via config setting.'}
        }
      },
      load:  function(){
        var fileCount = (_.isArray(self.installFiles) && self.installFiles.length) || 0
        return {action: 'log', msg: 'Preparing to install ' + fileCount + ' plugin files...'}
      },
      install: function(){
        return {action: 'log', msg: 'Install Files pending.'}
      },
      dependency: function(){
        var deps = self.getDepNames()
        return {action: 'log', msg: 'Dependencies pending, ' + deps}
      },
      injectdeps: function(){
        var deps = self.getDepNames()
        return {action: 'log', msg: deps + ' Added to Injector.'}
      },
      start: function(){
        return {action: 'log', msg: 'Started.'}
      },
      stop:  function(){
        return {action: 'log', msg: 'Stopped.'}
      },
      idle:  function(){
        return false

      },
      error: function(){
        var errorDetail = _.map(self.Errors, function(err){
          return outputUtils.formatErr(err)
        }).join('\n')
        return {action: 'error', msg: 'Transitioned to error with ' + self.Errors.length + ' error/s.' + errorDetail}

      }
    },
    err: {
      initialize: function(){
        return {action: 'error', msg: 'Encountered Error while Inititializing'}
      },
      load:  function(err){
        return {action: 'error', msg: 'Encountered an error while loading.'}
      },
      install:  function(err){
        return {action: 'error', msg: 'Encountered an error while loading.'}
      },
      dependency: function(err){
        return {action: 'error', msg: 'Transitioned to dependency.'}
      },
      injectdeps: function(){
        var deps = self.getDepNames()
        return {action: 'log', msg: 'Adding Dependencies, ' + deps}
      },
      start: function(err){
        return {action: 'error', msg: 'Encountered an error while starting. '}
      },
      stop:  function(err){
        return {action: 'error', msg: 'Encountered an error while stopping. '}
      },
      idle:  function(err){
        return false
      },
      error: function(err){
        return {action: 'error', msg: 'encountered an error. '}
      }
    }
  }
}

module.exports = InstallerOutput
