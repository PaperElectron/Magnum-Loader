/**
 * @file ApplicationEnvironment
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
var _ = require('lodash');
/**
 *
 * @module ApplicationEnvironment
 */

exports.options = {
  checkExistence: []
}

exports.metadata = {
  name: 'Environment',
  type: 'action'
}

exports.plugin = {
  load: function(inject, loaded) {
    var missing = _.filter(this.options.checkExistence, function(key){
      return _.isUndefined(process.env[key])
    })
    if(missing.length){
      return loaded(new Error('Missing Environment variables ' + missing.join(', ')))
    }
    loaded(null, null)
  },
  start: function(done) {
    done()
  },
  stop: function(done) {
    done()
  }
}