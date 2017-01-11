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
  name: 'Hook-Throws',
  layer: 'core',
  type: 'service',
  param: 'Test'
}

exports.plugin = {
  load: function(inject, loaded){
    this_throws();
    loaded(null, {})
  },
  start: function(done) {
    done()
  },
  stop: function(done) {
    done()
  }
}