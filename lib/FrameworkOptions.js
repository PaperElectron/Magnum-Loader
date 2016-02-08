/**
 * @file OptionParser
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
var _ = require('lodash');
var fs = require('fs');
/**
 * Parses and normalizes the Loaders configuration object.
 *
 * @param lOpts Loader Options
 * @param Errors Custom Error Object
 * @returns {{prefix: String},{layers: String[]},{pluginDirectory: String}, {timeout: Number}, {logger: Object}, {verbose: Boolean}, {colors: Boolean}}
 */
module.exports = function(lOpts, Errors){
  var pOpts = {};
  if(!lOpts) throw new TypeError('No Raw Config object provided.');
  if(!Errors) throw new TypeError('No Custom Errors provided.');
  if(!lOpts.prefix) throw new Errors.OptionsError('options.prefix not set.');
  if(!lOpts.layers) throw new Errors.OptionsError('options.layers not set.');
  if(!lOpts.logger) throw new Errors.OptionsError('options.logger not set.');

  pOpts.prefix = lOpts.prefix;
  pOpts.layers = lOpts.layers;
  pOpts.parentDirectory = parentDirExits(lOpts.parentDirectory, Errors.OptionsError);
  pOpts.applicationDirectory = applicationDirExists(lOpts.applicationDirectory, pOpts.parentDirectory, Errors.OptionsError);
  pOpts.pluginDirectory = pluginDirExists(lOpts.pluginDirectory, Errors.OptionsError);
  pOpts.timeout = lOpts.timeout || 2000;
  pOpts.logger = inspectLogger(lOpts.logger, Errors.OptionsError);
  pOpts.verbose = ForV(lOpts.verbose);
  pOpts.colors = ForV(lOpts.colors);
  return pOpts
};

function parentDirExits(dir, Err){
  if(!dir) throw new Err('options.parentDirectory not set.');
  var d = dirExists(dir);
  if(d) return d;

  throw new Err('options.parentDirectory doesnt exist.')
}

function applicationDirExists(dir, defaultAppDir, Err){
  if(!dir) return defaultAppDir;
  var d = dirExists(dir);
  if(d) return d;

  throw new Err('options.applicationDirectory doesn\'t exist or is not a directory.')
}

function pluginDirExists(dir, Err){
  if(!dir) return false;
  var d = dirExists(dir);
  if(d) return d;

  throw new Err('options.pluginDirectory doesn\'t exist or is not a directory.')
}

function dirExists(directory){
  try {
    var stats = fs.statSync(directory)
  }
  catch(e){
    return false
  }
  if(stats.isDirectory()){
    return directory
  }
  return false
}

function inspectLogger(loggerObj, Err){
  var missing = [];
  var valid = _.chain(['log', 'error', 'info', 'warn'])
    .map(function(v) {
      var fn = _.isFunction(loggerObj[v]);
      if(!fn){ missing.push(v) }
      return fn
    })
    .every(Boolean)
    .value();
  if(valid){
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