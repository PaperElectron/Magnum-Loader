/**
 * @file BaseOutput
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
'use strict';
var _ = require('lodash');
var outputUtils = require('./OutputUtils');

/**
 *
 * @module BaseOutput
 */

function BaseOutput(){
  var self = this;
  return {
    ok: {
      initialize: function(){
        if(self.valid && self.enabled){
          return {action: 'log', msg: 'Initialized plugin'}
        } else if(!self.enabled){
          return {action: 'warn', msg: 'disabled via config setting.'}
        }
      },
      load:  function(){
        return {action: 'log', msg: 'Loaded. No dependencies.'}
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
      initialize: function(err){
        return {action: 'error', msg: 'Encountered Error while Inititializing *** ' + err}
      },
      load:  function(err){
        return {action: 'error', msg: 'Encountered an error while loading. *** ' + err}
      },
      start: function(err){
        return {action: 'error', msg: 'Encountered an error while starting. *** ' + err}
      },
      stop:  function(err){
        return {action: 'error', msg: 'Encountered an error while stopping. ***' + err}
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

module.exports = BaseOutput