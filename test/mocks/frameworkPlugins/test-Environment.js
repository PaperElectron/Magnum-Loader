/**
 * @file test-Environment
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';

/**
 *
 * @module test-Environment
 */

exports.options = {
  port: '8080'
}

exports.metadata = {
  name: 'TestEnv',
  layer: 'core',
  type: 'service',
  param: 'TestEnv'
}

exports.plugin = {
  load: function(inject, loaded) {
    loaded(null, {optPort: this.options.port})
  },
  start: function(done) {
    done()
  },
  stop: function(done) {
    done()
  }
}