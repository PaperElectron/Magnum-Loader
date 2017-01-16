/**
 * Created by monstertke on 1/7/17.
 */
'use strict';

let DI = require('magnum-di');
let NameGenerator = require('../lib/Validation/NameGenerator')
let Iterator = require('../lib/PluginIterator')
let Output = require('../lib/Outputs')
let RawPlugin = require('../lib/RawPlugin/Types/Dependency')
let Plugin = require('../lib/Plugin/Plugin')
let OptionValidators = require('../lib/Validation/FrameworkOptionValidators')

function TestBuilder(verbose){
  this.verbose = verbose || false
  this.FrameworkInjector = new DI()
  this.PluginInjector = new DI()
}

TestBuilder.prototype.getFrameworkDI = function() {
  return this.FrameworkInjector
}

TestBuilder.prototype.getPluginDI = function() {
 return this.PluginInjector
}

TestBuilder.prototype.getOutput = function(colors, verbose) {
  return Output(colors, verbose)
}

TestBuilder.prototype.findPluginSettings = function(mockSettingsPath) {
  return OptionValidators.findPluginSettings(mockSettingsPath)
}

TestBuilder.prototype.makePlugin = function(name, depends, provides) {
  var pArgs =
        {
          loaded: {
            options: {name: name},
            metadata: {
              name: name,
              type: 'service',
              depends: depends || [],
              provides: provides || [],
              param: name.replace('-', '_')},
            plugin: {
              load: function(inject, loaded) {
                loaded(null, {name: name})
              },
              start: function(done) {
                done()
              },
              stop: function(done) {
                done()
              }
            }
          },
          moduleName: name
        };
  var plugin = new RawPlugin(pArgs)
  return new Plugin(plugin, this.FrameworkInjector, this.PluginInjector)
}

TestBuilder.prototype.mockConsole = function() {

  if(this.verbose){
    return console
  }

  return {
    log: function() {
    },
    error: function() {
    },
    info: function() {
    },
    warn: function() {
    },
  }
}

module.exports = TestBuilder