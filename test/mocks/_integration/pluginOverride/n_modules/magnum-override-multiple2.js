/**
 * @file magnum-override-multiple2
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';

/**
 *
 * @module magnum-override-multiple2
 */

module.exports = [
  {
    metadata: {
      name: 'Override2Ok',
      type: 'service',
      param: 'Override2Ok'
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
      name: 'OverrideStock2',
      type: 'service',
      param: 'Override2Stock'
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