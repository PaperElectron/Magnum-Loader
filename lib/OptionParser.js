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

  var pOpts = {}

  if(!lOpts.prefix) throw new Errors.OptionsError('options.prefix not set');
  if(!lOpts.layers) throw new Errors.OptionsError('options.layers not set!');

  pOpts.prefix = lOpts.prefix;
  pOpts.layers = lOpts.layers;
  pOpts.parentDirectory = dirExists(lOpts.parentDirectory);
  pOpts.pluginDirectory = dirExists( lOpts.pluginDirectory);
  pOpts.timeout = lOpts.timeout || 2000;
  pOpts.logger = inspectLogger(lOpts.logger);
  pOpts.verbose = ForV(lOpts.verbose);
  pOpts.colors = ForV(lOpts.colors);
  return pOpts
}

function dirExists(directory){
  if(!directory) return false
  try {
    var stats = fs.statSync(directory)
  }
  catch(e){
    console.log(e);
    return false
  }
  if(stats.isDirectory()){
    return directory
  }
  return false
}

function inspectLogger(loggerObj){
  if(!loggerObj){
    console.error('Logger object provided must expose log, error, info and warn methods at a minimum');
    console.error('Will use console as default Logger.');
    return console
  }
  var missing = []
  var valid = _.chain(['log', 'error', 'info', 'warn'])
    .map(function(v) {
      var fn = _.isFunction(loggerObj[v])
      if(!fn){ missing.push(v) }
      return fn
    })
    .every(Boolean)
    .value()
  if(valid){
    return loggerObj
  }

  console.log('Logger object provided missing ' + missing + ' methods.');
  console.error('Will use console as default Logger.');
  return console
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