/**
 * @file disabledPlugin
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';

/**
 *
 * @module disabledPlugin
 */

exports.options = {
  workDir: './missing'
}

exports.metadata = {
  name: 'Disabled-Plugin',
  layer: 'core',
  type: 'service',
  param: 'Disabled'
}

exports.plugin = {
  load: function(inject, loaded){
    loaded(null, {name: 'Test'});
  },
  start: function(done) {
    done()
  },
  stop: function(done) {
    done()
  }
}