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
  exports.title = chalk.cyan

  return exports
};


exports.load = {
  announce: function(name){
    var title = 'Loading ' + name + ' Layer';
    return exports.title(titleBar(title))
  },
  individual: function(name){
    return exports.ok(exports.emph(name) + ' plugin loaded.')
  }
}

exports.start = {
  announce: function(name){
    var title = 'Starting ' + name + ' Layer';
    return exports.title(titleBar(title))
  },
  individual: function(name){
    return exports.ok(exports.emph(name) + ' plugin started.')
  }
}

exports.stop = {
  announce: function(name){
    var title = 'Stopping ' + name + ' Layer'
    return exports.title(titleBar(title))
  },
  individual: function(name){
    return exports.ok(exports.emph(name) + ' plugin stopped.')
  }
}

exports.errorTitle = function(message){
  return exports.err(titleBar(message));
}

exports.missingName = function(name){
  return exports.err('Loader: Plugin ' + name + ' requires "name" property in exports.metadata.')
}

exports.missingMetadata = function(name){
  return exports.err('Loader: ' + name + ' missing exports.metadata and cannot load.')
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

function titleBar(message){

  var format = message ? ' ' + message + ' ' : []
  var count = (format.length >= 80) ? 0 : 80 - format.length
  for(; count--;){
    if(count % 2){
      format = '-' + format
    }
    else{
      format = format + '-'
    }
  }

  return format
}