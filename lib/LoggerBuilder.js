/**
 * @file AppendLogger
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */
'use strict';
var _ = require('lodash');
/**
 *
 * @module PluginLogger
 */

exports = module.exports = function(Logger, Name, Output, verbose, logColor) {
  var Chalk = Output.chalk;
  var Append = Name + ':';
  var lColor = logColor || 'green'
  if(verbose) {
    return {
      log: function() {
        [].unshift.call(arguments, Append);
        var args = Chalk[lColor].apply(Chalk, arguments);
        return Logger.log.call(Logger, args)
      },

      warn: function() {
        [].unshift.call(arguments, Append)
        var args = Chalk.yellow.apply(Chalk, arguments);
        return Logger.warn.call(Logger, args)
      },

      error: function() {
        [].unshift.call(arguments, Append)
        var args = Chalk.red.apply(Chalk, arguments);
        return Logger.error.call(Logger, args)
      },

      info: function() {
        [].unshift.call(arguments, Append)
        var args = Chalk.cyan.apply(Chalk, arguments);
        return Logger.info.call(Logger, args)
      }
    }
  }
  return {
    log: function(){return true},
    warn: function(){return true},
    info: function(){return true},
    error: function() {
      [].unshift.call(arguments, Append)
      var args = Chalk.red.apply(Chalk, arguments);
      return Logger.error.call(Logger, args)
    }
  }
}