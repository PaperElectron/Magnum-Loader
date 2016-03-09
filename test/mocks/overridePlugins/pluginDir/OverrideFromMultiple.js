/**
 * @file OverrideFromMultiple
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';

/**
 *
 * @module OverrideFromMultiple
 */

module.exports = [
  {
    metadata: {
      name: 'Fake',
      layer: 'core',
      type: 'none'
    },

    plugin: {
      load: function(inject, loaded) {
        loaded(null)
      },
      start: function(done) {
        done()
      },
      stop: function(done) {
        done()
      }
    }
  },
  {
    override: {
      module: 'magnum-override-multiple3',
      name: 'Override3Ok'
    },

    plugin: {
      load: function(injector, loaded) {
        loaded(null, {plugin: 'overridden from multiple'})
      },
      start: function(done) {
        done(null)
      },
      stop: function(done) {
        done(null)
      }
    }
  }
]

