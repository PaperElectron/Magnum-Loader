/**
 * @file PostActions
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
var Promise = require('bluebird');
var _ = require('lodash');
/**
 *
 * @module PostActions
 */

module.exports = function(instance){

  var injectService = function(groupName, metaData, loadTarget) {
    return function() {
      var retry = 2;
      var finalName = loadTarget.name;
      var targetObject = loadTarget.load;

      var tryInject = function(depName) {
        if(!retry) return false
        try {
          if(loadTarget.factory){
            instance.injector.factory(depName, targetObject)
          } else {
            instance.injector.service(depName, targetObject)
          }

          return {groupName: groupName,humanName: metaData.humanName, finalName: finalName}
        }
        catch (e) {
          if(retry) {
            instance.Logger.error(instance.output.conflictingName(metaData.humanName, depName));
          }
          retry -= 1;
          //TODO: Make this run twice only.
          finalName = metaData.humanName.replace('-', '_') + '_' + loadTarget.name;

          instance.Logger.error(instance.output.fixConflict(finalName));
          return tryInject(finalName)
        }
      };
      var result = tryInject(finalName)
      //instance.Logger.log(instance.output.injectedDep(groupName,metaData.humanName,finalName));
      return result;
    }
  }

  var injectArray = function(groupName, meta, dependencyObjs) {
    return function() {
      var multiDependencies = _.chain(dependencyObjs)
        .map(function(d) {
        var isObj = _.isObject(d.load)
        var isString = _.isString(d.name)
        if(isObj && isString) {
          return injectService(groupName, meta, d)()
        }
      }).filter(Boolean).value()
      var loadedPlugins = _.map(multiDependencies, function(p){
        return p.finalName
      }).join(', ')

      instance.Logger.log(instance.output.injectedMultipleDep(groupName,meta.humanName,loadedPlugins));
    }
  }

  var injectSingle = function(groupName, meta, loadTarget){
    return function(){
      var dependency = injectService(groupName, meta, loadTarget)()
      instance.Logger.log(instance.output.injectedDep(groupName,meta.humanName,dependency.finalName));
    }
  }

  return {

    init: function(result){
      return new Promise(function(resolve, reject){
        resolve({ok: 1})
      });
    },

    load: function(result) {
      return new Promise(function(resolve, reject) {
        var injectOrder = [];

        /*
         * We want to give name precedence to plugins that declare a name over ones that
         * simply return an array of objects to be added to the injector, so order them here.
         */

        _.each(result, function(p){
          var groupName = p.plugin.humanLayer

          if(p.meta.inject && !_.isArray(p.returned)) {
            // If the plugin declares a depencency name, give it precedence.
            var loadTarget = {name: p.meta.inject, load: p.returned, factory: p.meta.factory || false};
            injectOrder.unshift(injectSingle(groupName, p.meta, loadTarget))
          }
          else {
            // If no dependency name declared, attempt to inject last.
            injectOrder.push(injectArray(groupName, p.meta, p.returned))
          }
        });
        var derp = _.map(injectOrder, function(l) {
          return l()
        })
        resolve(injectOrder)
      });
    },
    start: function(result) {
      return new Promise(function(resolve, reject) {
        resolve({ok: 1})
      });
    },
    stop: function(){
      return new Promise(function(resolve, reject) {
        resolve({ok: 1})
      });
    }
  }
}

