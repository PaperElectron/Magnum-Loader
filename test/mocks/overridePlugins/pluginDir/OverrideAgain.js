/**
 * @file OverrideAgain
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';

/**
 *
 * @module OverrideAgain
 */

exports.override = {
  module: 'magnum-override-multiple2',
  name:'Override2Ok'
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