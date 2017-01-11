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
for (var i = 0; i < 80; i++) {
  blockBar[i] = "-"
}
blockBar = blockBar.join('');

exports = module.exports = function(colors, verbose) {
  exports.verbose = verbose;
  exports.colors = colors;
  exports.chalk = new chalkCtor.constructor({enabled: colors});
  return exports
};

exports.rightBar = function(message, color, separator) {
  color = color || 'magenta'
  if(!separator) separator = '-';

  var format = message ? message + ' ' : []
  var count = (format.length >= 80) ? 0 : 80 - format.length
  for (; count--;) {
    if(count) {
      format = format + separator
    }
  }
  return exports.chalk.bold[color](format)
}

exports.titleAnnounce = function(message, color) {
  if(exports.verbose) {
    return exports.rightBar(message, color)
  }
  return message
}

exports.layerAnnounce = function(layer, action) {
  var suffix = (action === 'stop') ? 'ping.' : 'ing.';
  if(exports.verbose) {
    return exports.rightBar(layer + ' layer ' + action + suffix)
  }
  return layer + ' layer ' + action + suffix
}

exports.pluginActionComplete = function(results, action, detail) {
  var pluginCount = 0;
  var deps = 0;
  _.each(results, function(p) {
    pluginCount += 1
    if(p.dependenciesAreArray()) {
      return deps += p.dependencies.length
    }
    if(p.dependencies) {
      deps += 1
    }
  })

  var additionalDetail = detail ? ' plugins with ' + deps + ' ' + detail : ' plugins.';
  return action + ' ' + pluginCount + additionalDetail
}

function titleBar(message, color, separator) {
  if(!separator) separator = '-';

  var format = message ? ' ' + message + ' ' : []
  var count = (format.length >= 80) ? 0 : 80 - format.length
  /**
   * Add invisible chars here after length has been established
   */
  format = exports.chalk.bold(format);
  for (; count--;) {
    if(count % 2) {
      format = separator + format
    }
    else {
      format = format + separator
    }
  }

  return exports.chalk[color](format)
}

function toCap(word, append) {
  if(!append) append = '';
  return word.charAt(0).toUpperCase() + word.slice(1) + append;
}

exports.failedToLoad = function(modulePath, err) {
  var message = [
    'Plugin loading failed.',
    'Could not load ' + modulePath,
    'This could either be an error in the plugin,',
    'Or the plugin was not found.',
    'If this error occurred in an externally loaded plugin from the',
    'node_modules folder contact the developer of the plugin.',
    'If the error occurred in one of your own plugins',
    'make sure it conforms to the specs in this guide.',
    'https://github.com/PaperElectron/Magnum-Loader/wiki/Plugin-Specifications'
  ];
  return message.join('\n');
}

exports.dependencyConflict = function(modules) {

  return 'Modules ' + modules.conflicts.join(', ') + ' are attempting to register dependency name "'
    + modules.depName + '"\n' +
    'This error can be corrected by setting the "namespace" option for one of the two plugins.'
}

exports.iteratorError = function(err, plugins) {

  var output = ''
  output += _.map(plugins, function(p) {
    // console.log(p.Errors);
    var msg = p.moduleName + ' has ' + p.Errors.length + ' error/s' + '\n'
    msg += _.map(p.Errors, function(e) {
      return e.message
    }).join('\n')

    return msg
  }).join('\n')

  return output
};