/**
 * @file injectableOutput
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
var _ = require('lodash');
var outputUtils = require('./OutputUtils');
/**
 *
 * @module injectableOutput
 */

function InjectableOutput(self){
  return {
    ok: {
      load:  function(){
        return self.Plugin.name + ' transitioned to loaded.'
      },
      start: function(){
        return self.Plugin.name + ' transitioned to started.'
      },
      stop:  function(){
        return self.Plugin.name + ' transitioned to stopped.'
      },
      idle:  function(){
        return self.Plugin.name + ' transitioned to idle.'
      },
      error: function(){
        var errorDetail = _.map(self.Errors, function(err){
          return outputUtils.formatErr(err)
        }).join('\n')
        return self.Plugin.name + ' transitioned to error with ' + self.Errors.length + ' error/s.' + errorDetail

      }
    },
    err: {
      load:  function(err){
        return self.Plugin.name + ' Encountered an error while loading. '
      },
      start: function(err){
        return self.Plugin.name + ' Encountered an error while starting. '
      },
      stop:  function(err){
        return self.Plugin.name + ' Encountered an error while stopping. '
      },
      idle:  function(err){
        return self.Plugin.name + ' is now in an idle state. '
      },
      error: function(err){
        return self.Plugin.name + ' encountered an error. '
      }
    }
  }
}

module.exports = InjectableOutput

