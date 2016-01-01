/**
 * @file PluginValidators
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
/**
 * Validates plugin metadata and hook methods.
 * @module PluginValidators
 */

exports.arguments = function(args){
  if(args.length < 3){
    throw new Error('Plugin requires 3 arguments.')
  }
}

exports.hookMethods = function(plugin){
  var methods = ['load', 'start', 'stop'];
  if(!plugin){
    throw new Error('Plugin does not contain a plugin property.')
  }
  var valid = _.chain(methods)
    .map(function(v) {
      return _.isFunction(plugin[v])
    })
    .every(Boolean)
    .value()
  if(valid){
    return plugin
  }
  throw new Error('Plugin missing hook methods.')
}

exports.metadata = function(metadata){
  if(!metadata){
    throw new Error('Plugin missing or invalid metadata');
  }
  return metadata
}

exports.humanName = function(moduleName){
  if(!moduleName){
    throw new Error('No module name.')
  }
  return moduleName.substr(moduleName.indexOf('-') + 1).replace('-', '_');
}

exports.validErrors = function(errorObjs){
  if(_.isObject(errorObjs)) {
    var e = _.pick(errorObjs, function(err) {
      return (err.prototype && err.prototype.name === 'Error')
    });
    return e
  }
  return false
}

exports.Config = function(parentPath, defaults, config){
  if(defaults){
    config = _.merge(defaults, config);
    var workDir = config.workDir;
    if(workDir){
      try {
        var absoluteWorkdir = path.join(parentPath, workDir)
        var stats = fs.statSync(absoluteWorkdir)
        if(stats.isDirectory()){
          config.workDir = absoluteWorkdir;
        }
      }
      catch(e){
        throw e
      }
    }
  }

  return config || {}
}