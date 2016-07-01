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

module.exports = [
  {
    metadata: {
      name: 'OverrideOk',
      type: 'service',
      param: 'OverrideOk'
    },
    plugin: {
      load: function(injector, loaded){
        loaded(null, {plugin: 'original'})
      },
      start: function(done){
        done(null)
      },
      stop: function(done){
        done(null)
      }
    }
  },
  {
    metadata: {
      name: 'OverrideStock',
      type: 'service',
      param: 'OverrideStock'
    },
    plugin: {
      load: function(injector, loaded){
        loaded(null, {plugin: 'untouched'});
      },
      start: function(done){
        done(null)
      },
      stop: function(done){
        done(null)
      }
    }
  }
];