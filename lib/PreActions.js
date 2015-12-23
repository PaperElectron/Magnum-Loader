/**
 * @file PreActions
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */
'use strict';
var Promise = require('bluebird');

/**
 *
 * @module PreActions
 */

module.exports = function(instance){
  return {
    load: function(p) {
      console.log(p);
      return new Promise(function(resolve, reject){

        var timer = setTimeout(function(){
          reject(new Error('Timeout exceeded ('+ instance.timeout +'ms) attempting to load ' + p.humanName))
        }, instance.timeout)

        return p.load(instance.injector.inject, function(err, toInject){
          clearTimeout(timer);
          if(err){
            return reject(err)
          }
          instance.Logger.log(instance.output['load'].individual(p.declaredName || p.humanName));

          //p.meta.loaded = true
          resolve({meta: p.metadata, returned: toInject})
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

          p.meta.started = true;
          resolve({meta: p.meta})
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

          p.meta.stopped = true;
          resolve({meta: p.meta})
        })
      })
    }
  };
}