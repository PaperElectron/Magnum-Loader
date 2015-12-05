/**
 * @file Outputs
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

/**
 * Output strings.
 * @module Outputs
 */
var chalk = require('chalk');

exports = module.exports = function(options){
  exports.options = options || {}
  exports.err = chalk.bold.red;
  exports.ok = chalk.green;
  exports.emph = chalk.bold

  return exports
};


exports.load = {
  announce: function(name){
    return exports.ok('Loading plugins for ' + name)
  },
  individual: function(name){
    return exports.ok(exports.emph(name) + ' plugin loaded.')
  }
}

exports.start = {
  announce: function(name){
    return exports.ok('Starting plugins for ' + name)
  },
  individual: function(name){
    return exports.ok(exports.emph(name) + ' plugin started.')
  }
}

exports.stop = {
  announce: function(name){
    return exports.ok('Stopping plugins for ' + name)
  },
  individual: function(name){
    return exports.ok(exports.emph(name) + ' plugin stopped.')
  }
}

exports.invalidPlugin = function(name){
  return exports.err(name + ' Must have load, start, unload and stop function properties.')
};

exports.conflictingName = function(humanName, depName){
  return exports.err('Plugin ' + humanName + ' attempted to load conflicting plugin name, ' + depName)
}

exports.fixConflict = function(finalName) {
  return exports.err('Attempting to rename conflicting object to ' + finalName)
}

exports.injectedDep = function(groupName, humanName, finalName){
  return exports.ok(groupName + ' plugin ' + humanName + ' added dependency ' + finalName + ' to injector.')
}