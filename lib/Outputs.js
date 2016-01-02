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
var chalkCtor = require('chalk');
var _ = require('lodash');


var blockBar = [];
for(var i = 0; i < 80; i++){
  blockBar[i] = "-"
}
blockBar = blockBar.join('');

exports = module.exports = function(colors, verbose){
  exports.verbose = verbose;
  exports.colors = colors;
  exports.chalk = new chalkCtor.constructor({enabled: colors});
  return exports
};

exports.layerAnnounce = function(layer, action){
  if(exports.verbose){
    return rightBar(layer + ' ' + action, 'green', '-')
  }
  return layer + ' ' + action
}

exports.pluginActionComplete = function(results, action, detail) {
  var pluginCount = 0;
  var deps = 0;
  _.each(results, function(plugin){
    pluginCount  += plugin.length
    _.each(plugin, function(p){
      if(p.dependenciesAreArray()){
        return deps += p.dependencies.length
      }
      if(p.dependencies){
        deps += 1
      }
    })
  })

  var additionalDetail = detail ?  ' plugins with ' + deps + ' ' + detail : ' plugins.';
  return action + ' ' + pluginCount + additionalDetail
}

function titleBar(message, color, separator){
  if(!separator) separator = '-';

  var format = message ? ' ' + message + ' ' : []
  var count = (format.length >= 80) ? 0 : 80 - format.length
  /**
   * Add invisible chars here after length has been established
   */
  format = exports.chalk.bold(format);
  for(; count--;){
    if(count % 2){
      format = separator + format
    }
    else{
      format = format + separator
    }
  }

  return exports.chalk[color](format)
}

function rightBar(message, color, separator){
  if(!separator) separator = '-';

  var format = message ? message + ' ' : []
  var count = (format.length >= 80) ? 0 : 80 - format.length
  format = exports.chalk.bold(format);
  for(; count--;){
    if(count){
      format = format + separator
    }
  }

  return exports.chalk[color](format)
}

function toCap(word, append){
  if(!append) append = '';
  return word.charAt(0).toUpperCase() + word.slice(1) + append;
}

exports.failedToLoadPlugin = 'Due to the failure to load one or several plugins the framework \n' +
  'cannot continue to function. If this error occurred in an externally loaded plugin from your \n' +
  'node modules folder contact the developer of the plugin. If the error occurred in one of your own \n' +
  'plugins make sure it conforms to the specs in this guide. \n' +
  'https://github.com/PaperElectron/Magnum-Loader/wiki/Plugin-Specifications';