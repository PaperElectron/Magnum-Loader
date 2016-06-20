/**
 * @file hookThrows
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';

/**
 *
 * @module hookThrows
 */

exports.metadata = {
  name: 'has-Late-Error',
  layer: 'core',
  type: 'service',
  param: 'Late'
}

exports.plugin = {
  load: function(inject, loaded){
    var self = this;
    setTimeout(function(){
      self.lateError(new Error('Im broken'));
    }, 1000)
    loaded(null, {})
  },
  start: function(done) {
    done()
  },
  stop: function(done) {
    done()
  }
}