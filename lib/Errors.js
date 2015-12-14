/**
 * @file Errors
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

var util = require('util');

/**
 * Custom Errors
 * @module Errors
 */

module.exports = {
  OptionsError: OptionsError,
  HookTimeoutError: HookTimeoutError
};


function OptionsError(){
  var thisErr = Error.apply(this, arguments);
  thisErr.name = this.name = "OptionsError";
  this.message = thisErr.message;
  if(Error.captureStackTrace){
    Error.captureStackTrace(this, this.constructor)
  }
}

util.inherits(OptionsError, Error);

function HookTimeoutError(){
  var thisErr = Error.apply(this, arguments);
  thisErr.name = this.name = "HookTimeoutError";
  this.message = thisErr.message;
  if(Error.captureStackTrace){
    Error.captureStackTrace(this, this.constructor)
  }
}

util.inherits(HookTimeoutError, Error);