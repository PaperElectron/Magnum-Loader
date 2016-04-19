/**
 * @file InstallerOutput
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';

var _ = require('lodash');
var outputUtils = require('./OutputUtils');
var BaseMessages = require('./BaseOutput');
/**
 *
 * @module InstallerOutput
 */

function InstallerOutput(){
  var Messages = BaseMessages.call(this)
  var self = this;

  Messages.ok.install = function(){
    return {action: 'log', msg: 'Install Files pending.'}
  }

  Messages.ok.load = function(){
    var fileCount = (_.isArray(self.installFiles) && self.installFiles.length) || 0
    return {action: 'log', msg: 'Preparing to install ' + fileCount + ' plugin files...'}
  }

  Messages.err.install = function(err){
    return {action: 'error', msg: 'Encountered an error while installing.'}
  }

  return Messages
}

module.exports = InstallerOutput
