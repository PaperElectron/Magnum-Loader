/**
 * @file FrameworkOptionValidators
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
var _ = require('lodash');
var path = require('path');
var fs = require('fs');
/**
 *
 * @module FrameworkOptionValidators
 */

module.exports = {
  parentDirExits: parentDirExits,
  applicationDirExists: applicationDirExists,
  pluginDirExists: pluginDirExists,
  dirExists: dirExists,
  findPluginSettings: findPluginSettings,
  inspectLogger: inspectLogger,
  ForV: ForV
}

function parentDirExits(dir, Err) {
  if(!dir) throw new Err('options.parentDirectory not set.');
  var d = dirExists(dir);
  if(d) return d;

  throw new Err('options.parentDirectory doesnt exist.')
}

function applicationDirExists(dir, defaultAppDir, Err) {
  if(!dir) return defaultAppDir;
  var d = dirExists(dir);
  if(d) return d;

  throw new Err('options.applicationDirectory doesn\'t exist or is not a directory.')
}

function pluginDirExists(dir, Err) {
  if(!dir) return false;
  var d = dirExists(dir);
  if(d) return d;

  throw new Err('options.pluginDirectory doesn\'t exist or is not a directory.')
}

function dirExists(directory) {
  try {
    var stats = fs.statSync(directory)
  }
  catch (e) {
    return false
  }
  if(stats.isDirectory()) {
    return directory
  }
  return false
}

function findPluginSettings(dir) {
  var settingsPath = dirExists(dir)
  var files = false;
  if(settingsPath) {
    files = _.map(fs.readdirSync(dir), function(file) {
      return path.basename(file, '.js')
    })
  }
  return {
    path: settingsPath,
    files: files
  }

}

function inspectLogger(loggerObj, Err) {
  var missing = [];
  var valid = _.chain(['log', 'error', 'info', 'warn'])
    .map(function(v) {
      var fn = _.isFunction(loggerObj[v]);
      if(!fn) {
        missing.push(v)
      }
      return fn
    })
    .every(Boolean)
    .value();
  if(valid) {
    return loggerObj
  }

  throw new Err('Logger object provided is missing ' + missing.join(', ') + ' methods.');
}

function ForV(bool){
  if(_.isBoolean(bool)){
    if(bool === false){
      return false
    }
    return true
  }
  return true
}