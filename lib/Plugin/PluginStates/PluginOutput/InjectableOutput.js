/**
 * @file injectableOutput
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
 * @module injectableOutput
 */

function InjectableOutput(){
  var Messages = BaseMessages.call(this)
  var self = this;

  Messages.ok.dependency = function(){
    var deps = self.getDepNames()
    return {action: 'log', msg: 'Dependencies pending, ' + deps}
  }

  Messages.ok.injectdeps = function(){
    var deps = self.getDepNames()
    return {action: 'log', msg: deps + ' Added to Injector.'}
  }

  Messages.err.dependency = function(err){
    return {action: 'error', msg: 'Transitioned to dependency.'}
  }

  Messages.err.injectdeps = function(){
    var deps = self.getDepNames()
    return {action: 'log', msg: 'Adding Dependencies, ' + deps}
  }

  return Messages
  
}

module.exports = InjectableOutput

