/**
 * @file PreActions
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */
'use strict';
var Promise = require('bluebird');
var _ = require('lodash');

/**
 *
 * @module PreActions
 */

module.exports = function(instance){
  return {

    init: function(p){
      return new Promise(function(resolve, reject){
        p.init(instance.Logger, instance.pluginOptions[p.humanName] || {});

        if(_.isObject(p.errors)){
          var e = _.pick(p.errors, function(err){
            return (err.prototype && err.prototype.name === 'Error')
          });

          instance.injector.merge('Errors', e)
        }

        resolve(true)
      });
    },

    load: function(p) {
      return new Promise(function(resolve, reject){

        var timer = setTimeout(function(){
          reject(new Error('Timeout exceeded ('+ instance.timeout +'ms) attempting to load ' + p.humanName))
        }, instance.timeout)

        return p.load(instance.injector.inject, function(err, toInject){
          p.toInject(toInject);
          clearTimeout(timer);
          if(err){
            return reject(err)
          }
          instance.Logger.log(instance.output['load'].individual(p.declaredName || p.humanName));

          p.loaded = true
          resolve({plugin: p, returned: toInject})
        })
      })
    },
    start: function(p) {
      return new Promise(function(resolve, reject){

        var timer = setTimeout(function(){
          reject(new Error('Timeout exceeded ('+ instance.timeout +'ms) attempting to start ' + p.humanName))
        }, instance.timeout)

        return p.start(function(err){
          clearTimeout(timer);
          if(err){
            return reject(err)
          }
          instance.Logger.log(instance.output['start'].individual(p.humanName));

          p.started = true;
          resolve({plugin: p})
        })
      })
    },
    stop: function(p) {
      return new Promise(function(resolve, reject){

        var timer = setTimeout(function(){
          reject(new Error('Timeout exceeded ('+ instance.timeout +'ms) attempting to stop ' + p.humanName))
        }, instance.timeout)

        return p.stop(function(err){
          clearTimeout(timer);
          if(err){
            return reject(err)
          }
          instance.Logger.log(instance.output['stop'].individual(p.meta.humanName));

          p.stopped = true;
          resolve({plugin: p})
        })
      })
    }
  };
}