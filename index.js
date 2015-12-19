/**
 * @file magnum-loader
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';

var _ = require('lodash');

var Promise = require('bluebird');
var Events = require('events').EventEmitter;
var util = require('util');
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');
var Errors = require('./lib/Errors');
var instance = null;
var preActions;
var postLoadActions;
/**
 *
 * @module magnum-loader
 */
function MagnumLoader(pkgjson, options) {
  Events.call(this)
  this.options = options || {};
  this.loadPrefix = options.prefix || (function(){throw new Errors.OptionsError('options.prefix not set')})();
  this.layers = options.layers || (function(){throw new Errors.OptionsError('options.layers not set!')})();
  this.additionalPluginDirectory = options.pluginDirectory || false
  this.pluginOptions = options.pluginOptions || {};
  this.timeout = options.timeout || 2000;
  this.Logger = this.options.logger || console;
  this.output = require('./lib/Outputs')(this.options.output);
  this.loadErrors = []
  this.states = {
    load: false,
    start: false,
    stop: false
  };
  this.dependencies = _.keys(pkgjson.dependencies);
  this.injector = require('magnum-di');

  /*
   * Add the custom errors object right off the bat.
   * So we have access to merge plugins custom errors into it.
   */
  this.injector.service('Errors', Errors)
  this.injector.service('Logger', this.Logger)
  instance = this;

  this.groupedPlugins = groupPlugins()
  preActions = require('./lib/PreActions')(instance);
  postLoadActions = require('./lib/PostActions')(instance);
  setImmediate(function() {
    instance.emit('ready')
  })
}

util.inherits(MagnumLoader, Events)

MagnumLoader.prototype.addPlugin = function(plugin){
  if(this.states.load) {
    throw new Error('Cannot add plugins after load has been called.')
  }
  var validate = validatePlugin(plugin.plugin, plugin.meta)
  if(!instance.groupedPlugins[validate.meta.layer]){
    instance.groupedPlugins[validate.meta.layer] = []
  }
  instance.groupedPlugins[validate.meta.layer].push(validate)
}

/**
 * Returns a reference to the Magnum DI injector object.
 * @returns {Object} Magnum DI
 */
MagnumLoader.prototype.getInjector = function(){
  return this.injector
}

/**
 *  Calls the load function of all loaded plugins, eventually adding the objects
 *  they return to the Magnum DI injector for use elsewhere.
 */
MagnumLoader.prototype.load = function() {
  if(this.states.load) {
    throw new Error('Load state already transitioned to.')
  }
  var self = this;
  this.states.load = true;
  iteratePlugins('load')
    .then(function(result) {
      self.emit('load')
      return null
    })
    .catch(function(err){
      self.emit('error', err)
    })
};

/**
 *  Calls the start function of all loaded plugins, in the order they were loaded.
 */
MagnumLoader.prototype.start = function() {
  if(this.states.start) {
    throw new Error('Start state already transitioned to.')
  }
  var self = this;
  this.states.start = true;
  iteratePlugins('start')
    .then(function(result) {
      if(instance.loadErrors.length > 0){
        outputAccumulatedErrors()
      }
      self.emit('start')
      return null
    })
    .catch(function(err){
      self.emit('error', err)
    })
};

/**
 *  Calls the stop function of all loaded plugins in the order they were loaded.
 */

MagnumLoader.prototype.stop = function() {
  if(this.states.stop) {
    throw new Error('Stop state already transitioned to.')
  }
  var self = this;
  this.states.stop = true;
  iteratePlugins('stop')
    .then(function(result) {
      self.emit('stop')
      return null
    })
    .catch(function(err){
      self.emit('error', err)
      self.emit('stop')
    })
};
/**
 * Returns all loaded plugins, optionally by group.
 * @param group Groupname to return
 * @returns {Object} Plugins
 */
MagnumLoader.prototype.getLoaded = function(group) {
  if(group) {
    return this.groupedPlugins[group]
  }
  return this.groupedPlugins
}

module.exports = function(injector, pkgjson, options) {
  if(instance) return instance;
  return new MagnumLoader(injector, pkgjson, options)
}


function groupPlugins(){
  var mergedPlugins;
  var internalPlugins = [];
  var externalPlugins = _.chain(instance.dependencies)
    .filter(function(dep) {
      if(dep.indexOf(instance.loadPrefix + '-') === 0) return dep
    })
    .map(function(dep){
      return {require: dep, external: true}
    })
    .value()

  // If plugin path is defined, get ready to load those as well.
  if(instance.additionalPluginDirectory){
    internalPlugins = _.map(fs.readdirSync(instance.additionalPluginDirectory), function(file){
      return {require: path.join(instance.additionalPluginDirectory, file), external: false, filename: file};
    })
  }

  // Merge our plugins from node_modules and the plugins from the user specified plugin directory.
  mergedPlugins = externalPlugins.concat(internalPlugins)

  return _.chain(mergedPlugins)
    .map(function(plugin) {
      var pluginName = plugin.require
      /*
       * Attempt to load from parent, if this is a linked module use the workaround.
       */
      try {
        var loadedPlugin = require(plugin.require)
      }
      catch (e) {
        var prequire = require('parent-require');
        loadedPlugin = prequire(plugin.require)
      }

      plugin.loaded = loadedPlugin;
      if(_.isArray(plugin.loaded)){
        return _.map(plugin.loaded, function(mPlugin){
          var multiplePluginin = _.chain(plugin).clone().omit('loaded').value()
          multiplePluginin.loaded = mPlugin
          return validatePlugin(multiplePluginin)
        })
      }
      return validatePlugin(plugin);

    }).flatten().filter(Boolean).groupBy('meta.layer').value();
}

/**
 * Validates plugins returned object as well as metadata.
 *
 * @param plugin The plugin object as loaded by require.
 * @param package The Plugins package.json file to extract metadata.
 * @returns {boolean|Object}
 */
function validatePlugin(plugin) {

  var pluginName = plugin.filename || plugin.require;
  var pluginMetaData = plugin.loaded.metadata
  if(!pluginMetaData) {
    var error = instance.output.missingMetadata(pluginName);
    instance.loadErrors.push(error)
    instance.Logger.warn(error)
    return false
  }
  pluginMetaData.requireName = pluginName;
  pluginMetaData.external = plugin.external;

  if(!plugin.external){
    if(!plugin.loaded.metadata.name) {
      var error = instance.output.missingName(plugin.filename);
      instance.loadErrors.push(error);
      instance.Logger.error(error);
      return false
    }
    pluginName = plugin.loaded.metadata.name
  }

  pluginMetaData.name = pluginName
  pluginMetaData.humanName = pluginName.substr(pluginName.indexOf('-') + 1).replace('-', '_');

  pluginMetaData.loaded = false
  plugin.loaded.plugin.options = instance.pluginOptions[pluginMetaData.humanName] || {};
  plugin.loaded.plugin.Logger = instance.Logger;
  plugin.loaded.plugin.Chalk = require('chalk');

  var methods = ['load', 'start', 'stop'];
  var lpValid = _.chain(methods)
    .map(function(v) {
      return _.isFunction(plugin.loaded.plugin[v])
    })
    .every(Boolean)
    .value()
  if(!lpValid) {
    instance.Logger.error(instance.output.invalidPlugin(pluginMetaData.humanName))
    return false
  }
  if(plugin.loaded.errors){
    mergeAttachedErrors(plugin.loaded.errors);
  }
  return _.merge(plugin.loaded.plugin, {meta: pluginMetaData});
}

/**
 * Functions passed to plugins for deferred execution.
 * @type {{load: Function, start: Function, stop: Function}}
 */
//var preActions = require('./lib/PreActions')(instance);
var preActionsOff = {
  load: function(p) {
    return new Promise(function(resolve, reject){

      var timer = setTimeout(function(){
        reject(new Error('Timeout exceeded ('+ instance.timeout +'ms) attempting to load ' + p.meta.humanName))
      }, instance.timeout)

      return p.load(instance.injector.inject, function(err, toInject){
        clearTimeout(timer);
        if(err){
          return reject(err)
        }
        instance.Logger.log(instance.output['load'].individual(p.meta.humanName));

        p.meta.loaded = true
        resolve({meta: p.meta, returned: toInject})
      })
    })
  },
  start: function(p) {
    return new Promise(function(resolve, reject){

      var timer = setTimeout(function(){
        reject(new Error('Timeout exceeded ('+ instance.timeout +'ms) attempting to start ' + p.meta.humanName))
      }, instance.timeout)

      return p.start(function(err){
        clearTimeout(timer);
        if(err){
          return reject(err)
        }
        instance.Logger.log(instance.output['start'].individual(p.meta.humanName));

        p.meta.started = true;
        resolve({meta: p.meta})
      })
    })
  },
  stop: function(p) {
    return new Promise(function(resolve, reject){

      var timer = setTimeout(function(){
        reject(new Error('Timeout exceeded ('+ instance.timeout +'ms) attempting to stop ' + p.meta.humanName))
      }, instance.timeout)

      return p.stop(function(err){
        clearTimeout(timer);
        if(err){
          return reject(err)
        }
        instance.Logger.log(instance.output['stop'].individual(p.meta.humanName));

        p.meta.stopped = true;
        resolve({meta: p.meta})
      })
    })
  }
};

/**
 * Functions ran on the object returned from the group iterator.
 * @type {{load: Function, start: Function, stop: Function}}
 */
var postLoadActionsoff = {
  load: function(result) {
    return new Promise(function(resolve, reject) {
      var injectOrder = [];

      /*
       * We want to give name precedence to plugins that declare a name over ones that
       * simply return an array of objects to be added to the injector, so order them here.
       */

      _.each(result, function(p){

        var groupName = p.meta.layer.charAt(0).toUpperCase() + p.meta.layer.slice(1);

        if(p.meta.inject && !_.isArray(p.returned)) {
          // If the plugin declares a depencency name, give it precedence.
          var loadTarget = {name: p.meta.inject, load: p.returned, factory: p.meta.factory || false};
          injectOrder.unshift(injectService(groupName, p.meta, loadTarget))
        }
        else {
          // If no dependency name declared, attempt to inject last.
          injectOrder.push(injectArray(groupName, p.meta, p.returned))
        }
      });

      _.map(injectOrder, function(l) {
        return l()
      })
      resolve(injectOrder)
    });
  },
  start: function(result) {
    return new Promise(function(resolve, reject) {
      resolve({ok: 1})
    });
  },
  stop: function(){
    return new Promise(function(resolve, reject) {
      resolve({ok: 1})
    });
  }
}

function iterators(group, action){
  var groupPlugins = group.plugins;

  instance.Logger.log(instance.output[action].announce(group.name))
  var toIterate = _.map(groupPlugins, function(p){
    return preActions[action](p).then(function(t) {
      return t
    })
  })

  return Promise.all(toIterate)
}


// Iterate over grouped plugins passing them to the appropriate iterator.
function iteratePlugins(action) {
  var plugins = instance.groupedPlugins

  // Create the layer array to load dependencies in order.
  var orderedLayers
  if(action === 'stop'){
    // If we are stopping the platform run in reverse order.
    orderedLayers = instance.layers
  } else {
    orderedLayers = instance.layers.slice().reverse()
  }
  var layers = _.map(orderedLayers, function(layer){
    var groupName = layer.charAt(0).toUpperCase() + layer.slice(1)
    return {name: groupName, plugins: plugins[layer]}
  });

  // Remove any layers that don't contain plugins.
  var groupArr = _.filter(layers, function(v) {
    return v.plugins
  });

  var index = groupArr.length - 1;
  function nextGroup(){
    var currentGroup = groupArr[index]
    index -= 1;
    if(currentGroup) {
      return iterators(currentGroup, action)
        .then(function(d) {
          return postLoadActions[action](d)
        })
        .then(function(result) {
          return nextGroup()
        })
    }
    return groupArr
  }

  return nextGroup()
}

function injectService(groupName, metaData, loadTarget) {
  return function() {
    var retry = 2;
    var finalName = loadTarget.name;
    var targetObject = loadTarget.load;

    var tryInject = function(depName) {
      if(!retry) return false
      try {
        if(loadTarget.factory){
          instance.injector.factory(depName, targetObject)
        } else {
          instance.injector.service(depName, targetObject)
        }

        return true
      }
      catch (e) {
        if(retry) {
          instance.Logger.error(instance.output.conflictingName(metaData.humanName, depName));
        }
        retry -= 1;
        //TODO: Make this run twice only.
        finalName = metaData.humanName.replace('-', '_') + '_' + loadTarget.name;

        instance.Logger.error(instance.output.fixConflict(finalName));
        return tryInject(finalName)
      }
    };
    var result = tryInject(finalName)

    instance.Logger.log(instance.output.injectedDep(groupName,metaData.humanName,finalName));
    return result;
  }
}

function injectArray(groupName, meta, dependencyObjs) {
  return function() {
    _.each(dependencyObjs, function(d) {
      var isObj = _.isObject(d.load)
      var isString = _.isString(d.name)
      if(isObj && isString) {
        injectService(groupName, meta, d)()
      }
    })
  }
}

function mergeAttachedErrors(errors){
  var e = _.pick(errors, function(err){
    return (err.prototype && err.prototype.name === 'Error')
  });

  instance.injector.merge('Errors', e)
}

function outputAccumulatedErrors(){
  var plural = instance.loadErrors.length === 1 ? ' error.' : ' errors.'
  var titleMsg = 'Start finished with ' + instance.loadErrors.length + plural;
  instance.Logger.error(instance.output.errorTitle(titleMsg))
  _.each(instance.loadErrors, function(err){
    instance.Logger.error(err)
  })
}