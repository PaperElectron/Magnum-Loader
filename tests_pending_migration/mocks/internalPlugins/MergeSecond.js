/**
 * @file MergeSecond
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';

/**
 *
 * @module MergeSecond
 */

exports.metadata = {
  name: 'MergeFirst',
  layer: "core",
  param: "MergePlugin",
  type: 'merge'
}

exports.plugin = {
  load: function(inject, loaded) {
    loaded(null, {second: 'second'})
  },
  start: function(done) {
    setTimeout(function(){
      done(null)
    }, 1500)
  },
  stop: function(done) {
    done(null)
  }
};