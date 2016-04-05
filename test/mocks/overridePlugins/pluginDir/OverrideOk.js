/**
 * @file magnum-override-multiple
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';

/**
 *
 * @module magnum-override-multiple
 */

exports.metadata = {
  name:'OverrideOk',
  type: 'override'
}

exports.override = {
  module: 'magnum-override-multiple',
  name:'OverrideOk'
};

exports.plugin = {
  load: function(injector, loaded) {
    loaded(null, {plugin: 'overridden'})
  },
  start: function(done) {
    done(null)
  },
  stop: function(done) {
    done(null)
  }
}