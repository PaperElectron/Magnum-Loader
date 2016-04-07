/**
 * @file Manager
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';

/**
 *
 * @module Manager
 */

var InjectablePlugin = require('./PluginStates/InjectablePlugin');
var Promise = require('bluebird');
var _ = require('lodash');


function injPlug(name) {
  this.name = name
  this.Errors = []
}

injPlug.prototype.load = function() {
  return new Promise(function(resolve, reject) {
    resolve({name: this.name, errors: this.Errors})
  }.bind(this))
}
injPlug.prototype.start = function() {
  return new Promise(function(resolve, reject) {
    resolve({name: this.name, errors: this.Errors})
  }.bind(this))
}
injPlug.prototype.stop = function() {
  return new Promise(function(resolve, reject) {
    resolve({name: this.name, errors: this.Errors})
  }.bind(this))
}

var plugObj = {
  one: [
    new InjectablePlugin(new injPlug('a')),
    new InjectablePlugin(new injPlug('b')),
    new InjectablePlugin(new injPlug('c'))
  ],
  two: [
    new InjectablePlugin(new injPlug('d')),
    new InjectablePlugin(new injPlug('e')),
    new InjectablePlugin(new injPlug('f'))
  ],
  three: [
    new InjectablePlugin(new injPlug('g')),
    new InjectablePlugin(new injPlug('h')),
    new InjectablePlugin(new injPlug('i'))
  ],
  four: [
    new InjectablePlugin(new injPlug('j')),
    new InjectablePlugin(new injPlug('k')),
    new InjectablePlugin(new injPlug('l'))
  ],
  five: [
    new InjectablePlugin(new injPlug('m')),
    new InjectablePlugin(new injPlug('n')),
    new InjectablePlugin(new injPlug('o'))
  ]
}

function getPins() {
  return [
    {name: 'Core', plugins: plugObj.one},
    {name: 'Data', plugins: plugObj.two},
    {name: 'Dependency', plugins: plugObj.three},
    {name: 'Platform', plugins: plugObj.four},
    {name: 'Server', plugins: plugObj.five}
  ]
}

var run = function(layers, action) {
  var self = this;
  var action = action || 'run'

  var processed = {processed: {}};
  var processLayer = function(layer) {
    if(layer.plugins.length) {
      console.log(layer.name);
    }
    return Promise.mapSeries(layer.plugins, function(plugin) {
        return plugin[action]()
      })
      .bind(processed)
      .then(function(result) {
        this.processed[layer.name] = result
        var nextLayer = layers.shift()
        return nextLayer ? processLayer(nextLayer) : this.processed
      })
  }

  return processLayer(layers.shift())
}

run(getPins())
  .then(function(result) {
    if(result) {
      var hasErrors = _.chain(result)
        .map(function(layer) {
          return layer
        })
        .flatten()
        .some(function(status) {
          return status.errors.length > 0
        })
        .value()
      if(hasErrors) {
        console.log('Failed with errors, entering stop state.');
        return run(getPins(), 'stopPlugin')
      }
      return run(getPins())
    }
    return result
  })
  .then(function(result) {
    if(result) {
      var hasErrors = _.chain(result)
        .map(function(layer) {
          return layer
        })
        .flatten()
        .some(function(status) {
          return status.errors.length > 0
        })
        .value()
      if(hasErrors) {
        console.log('Failed with errors');
        return run(getPins(), 'stopPlugin')
      }
      return run(getPins())
    }
    return result
  })
  .then(function(result) {
    console.log(result);
  })

  .catch(function(err) {
    console.log(err);
  })

