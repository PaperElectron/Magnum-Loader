/**
 * @file multiplePlugin
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

/**
 *
 * @module multiplePlugin
 */

module.exports = [
  {
    options: {defaultName: 'No config'},
    metadata: {
      name: 'MultiplePlugin',
      layer: 'core',
      type: 'service',
      param: 'Multiple'
    },

    plugin: {
      load: function(inject, loaded) {

        loaded(null, {name: 'Multiple'});
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
    metadata: {
      name: 'MultiplePlugin2',
      layer: 'core',
      type: 'service',
      param: 'Multiple2'
    },

    plugin: {
      load: function(inject, loaded) {

        loaded(null, {name: 'Multiple2'});
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
    metadata: {
      name: 'MultiplePlugin3',
      param: 'Multiple3',
      type: 'action',
      layer: 'core'
    },

    plugin: {
      load: function(inject, loaded) {

        loaded(null, null);
      },
      start: function(done) {
        done()
      },
      stop: function(done) {
        done()
      }
    }
  }
]