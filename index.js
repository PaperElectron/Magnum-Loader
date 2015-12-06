/**
 * @file magnum-loader
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

var _ = require('lodash');
var Promise = require('bluebird');
var Events = require('events').EventEmitter;
var util = require('util');

var instance = null;

/**
 *
 * @module magnum-loader
 */
function MagnumLoader(injector, pkgjson, options) {
  Events.call(this)
  this.options = options || {};
  this.loadPrefix = options.prefix || (function(){throw new Error('No Load Prefix set.')})()
  this.layers = options.layers || (function(){throw new Error('No Load Layers set.')})()
  this.pluginOptions = options.pluginOptions || {};
  this.Logger = this.options.logger || console;
  this.output = require('./lib/Outputs')(this.options.output);
  this.states = {
    load: false,
    start: false,
    stop: false
  };
  this.dependencies = _.keys(pkgjson.dependencies);
  this.injector = injector;
  instance = this;

  var pomegranatePlugins = _.filter(this.dependencies, function(dep) {
    if(dep.indexOf(instance.loadPrefix + '-') === 0) return dep
  })

  // Iterate over prefixed modules, load them and their metadata.
  this.groupedPlugins = _.chain(pomegranatePlugins)
    .map(function(plugin) {
      var validPlugin;
      /*
       * Attempt to load from parent, if this is a linked module use the workaround.
       */
      try {
        var loadedPlugin = require(plugin)
        var pluginPackage = require(plugin + '/package')
      }
      catch (e) {
        var prequire = require('parent-require');
        loadedPlugin = prequire(plugin)
        pluginPackage = prequire(plugin + '/package')
      }

      return validatePlugin(loadedPlugin, pluginPackage);

    }).filter(Boolean).groupBy('meta.type').value();

  setImmediate(function() {
    instance.emit('ready')
  })
}

util.inherits(MagnumLoader, Events)

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
      self.emit('start')
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

/**
 * Validates plugins returned object as well as metadata.
 *
 * @param plugin The plugin object as loaded by require.
 * @param package The Plugins package.json file to extract metadata.
 * @returns {boolean|Object}
 */
function validatePlugin(plugin, package) {
  var pluginMetaData = package.pomegranate

  if(!pluginMetaData) {
    instance.Logger.warn('Plugin: ' + package.name + ' missing metadata and cannot load.')
    return false
  }

  pluginMetaData.name = package.name
  pluginMetaData.humanName = package.name.split('pomegranate-')[1].replace('-', '_');
  pluginMetaData.loaded = false
  plugin.options = instance.pluginOptions[pluginMetaData.humanName] || {};

  var methods = ['load', 'start', 'stop'];
  var lpValid = _.chain(methods)
    .map(function(v) {
      return _.isFunction(plugin[v])
    })
    .every(Boolean)
    .value()
  if(!lpValid) {
    instance.Logger.error(instance.output.invalidPlugin(pluginMetaData.humanName))
    return false
  }
  return _.merge(plugin, {meta: pluginMetaData});
}

/**
 * Functions passed to plugins for deferred execution.
 * @type {{load: Function, start: Function, stop: Function}}
 */
var preActions = {
  load: function(p) {
    return function(resolve, reject){
      return p.load(instance.injector.inject, function(err, toInject){

        instance.Logger.log(instance.output['load'].individual(p.meta.humanName));

        p.meta.loaded = true
        resolve({meta: p.meta, returned: toInject})
      })
    }
  },
  start: function(p) {
    return function(resolve, reject){
      return p.start(function(err){

        instance.Logger.log(instance.output['start'].individual(p.meta.humanName));

        p.meta.started = true;
        resolve({meta: p.meta})
      })
    }
  },
  stop: function(p) {
    return function(resolve, reject){
      var timer = setTimeout(function(){
        reject(new Error('Timeout exceeded attempting to stop ' + p.meta.humanName))
      }, 2000)
      return p.stop(function(err){
        clearTimeout(timer);
        instance.Logger.log(instance.output['stop'].individual(p.meta.humanName));

        p.meta.stopped = true;
        resolve({meta: p.meta})
      })
    }
  }
};

/**
 * Functions ran on the object returned from the group iterator.
 * @type {{load: Function, start: Function, stop: Function}}
 */
var postLoadActions = {
  load: function(result) {
    return new Promise(function(resolve, reject) {
      var injectOrder = [];
      _.each(result, function(p){

        var groupName = p.meta.type.charAt(0).toUpperCase() + p.meta.type.slice(1);

        if(p.meta.inject && !_.isArray(p.returned)) {
          // If the plugin declares a depencency name, give it precedence.
          injectOrder.unshift(injectService(groupName, p.meta.humanName, p.meta.inject, p.returned))
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
  start: function() {
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
  var toIterate = [];
  var groupPlugins = group.plugins;
  var index = groupPlugins.length - 1;

  instance.Logger.log(instance.output[action].announce(group.name))

  while (index >= 0){
    var toResolve = preActions[action](groupPlugins[index])
    index -= 1;
    toIterate.push(new Promise(toResolve))
  }

  return Promise.all(toIterate)
}


// Iterate over grouped plugins passing them to the appropriate iterator.
function iteratePlugins(action) {
  var plugins = instance.groupedPlugins

  // Create the layer object to load dependencies in order.
  var layers = _.map(instance.layers.reverse(), function(layer){
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

function injectService(groupName, humanName, dependencyName, dependencyObj) {
  return function() {
    var retry = 2;
    var finalName = dependencyName;
    var tryInject = function(depName) {
      if(!retry) return false
      try {
        instance.injector.service(depName, dependencyObj)
        return true
      }
      catch (e) {
        if(retry) {
          instance.Logger.error(instance.output.conflictingName(humanName, depName));
        }
        retry -= 1;
        //TODO: Make this run twice only.
        finalName = humanName.replace('-', '_') + '_' + dependencyName;

        instance.Logger.error(instance.output.fixConflict(finalName));
        return tryInject(finalName)
      }
    };

    var result = tryInject(finalName)

    instance.Logger.log(instance.output.injectedDep(groupName,humanName,finalName));
    return result;
  }
}

function injectArray(groupName, meta, dependencyObjs) {
  return function() {
    _.each(dependencyObjs, function(d) {
      var isObj = _.isObject(d.load)
      var isString = _.isString(d.name)
      if(isObj && isString) {
        injectService(groupName, meta.humanName, d.name, d.load)()
      }
    })
  }
}
