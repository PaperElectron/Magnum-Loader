/**
 * @file multipleConfig
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';

/**
 *
 * @module multipleConfig
 */

module.exports = [
  {
    options: {defaultName: 'MultipleConfig1', setName: 'OtherValue'},
    metadata: {
      name: 'MultipleConfig1',
      type: 'service',
      param: 'MultipleConfig1'
    },

    plugin: {
      load: function(inject, loaded) {

        loaded(null, {defaultName: this.options.defaultName, setName: this.options.setName});
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
    options: {name: 'MultipleConfig2'},
    metadata: {
      name: 'MultipleConfig2',
      param: 'MultipleConfig2',
      type: 'action'
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