/**
 * @file UseInjector
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';

/**
 *
 * @module UseInjector
 */


exports.metadata = {
  name: 'UseInjector',
  layer: 'dependency',
  type: 'service',
  depends: ['TestPlugin'],
  param: 'InjectorTest'

}

exports.plugin = {
  load: function(inject, loaded) {

    var Injected = inject(function(Test){ return Test})

    loaded(null, {Injected: Injected})
  },
  start: function(done) {
    done()
  },
  stop: function(done) {
    done()
  }
}