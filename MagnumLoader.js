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
    if(dep.indexOf('pomegranate-') === 0) return dep
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
  iteratePlugins(loadIterator)
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
  this.states.start = true;
  this.emit('start')
};

/**
 *  Calls the stop function of all loaded plugins in the order they were loaded.
 */

MagnumLoader.prototype.stop = function() {
  if(this.states.stop) {
    throw new Error('Stop state already transitioned to.')
  }
  this.states.stop = true;
  this.emit('stop')
};
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
  pluginMetaData.humanName = package.name.split('pomegranate-')[1];
  pluginMetaData.loaded = false

  var methods = ['load', 'start', 'stop'];
  var lpValid = _.chain(methods)
    .map(function(v) {
      return _.isFunction(plugin[v])
    })
    .every(Boolean)
    .value()
  if(!lpValid) {
    instance.Logger.error(instance.output.invalidPlugin(pluginMetaData.humanName))
    //instance.Logger.error(pluginMetaData.humanName + ' Must have load, start, unload and stop function properties.')
    return false
  }
  return _.merge(plugin, {meta: pluginMetaData});
}

function loadRunner(group) {
  var toLoad = []
  var groupPlugins = group.plugins
  var index = groupPlugins.length - 1;

  instance.Logger.log(instance.output.loadingPlugins(group.name));

  while (index >= 0) {
    var toResolve = (function(p) {
      return function(resolve, reject){
        return p.load(instance.injector.inject, function(err, toInject){

          instance.Logger.log(instance.output.pluginLoaded(p.meta.name));

          p.meta.loaded = true
          resolve({meta: p.meta, returned: toInject})
        })
      }
    })(groupPlugins[index]);

    index -= 1;
    toLoad.push(new Promise(toResolve))
  }

  return Promise.all(toLoad).then(function(loaded){
    //load finished, need to sort by array vs object, load into injector and check for conflicts.
    var injectOrder = [];
    _.each(loaded, function(p){
      if(p.meta.inject && !_.isArray(p.returned)) {
        // If the plugin declares a depencency name, give it precedence.
        injectOrder.unshift(injectService(group.name, p.meta.humanName, p.meta.inject, p.returned))
      }
      else {
        // If no dependency name declared, attempt to inject last.
        injectOrder.push(injectArray(group.name, p.meta, p.returned))
      }
    });

    return injectOrder
  }).then(function(load) {
    return _.map(load, function(l) {
      return l()
    })
  })
}

function loadIterator(plugins) {
  var index = plugins.length - 1
  function build() {
    var currentPlugin = plugins[index]
    index -= 1;
    if(currentPlugin) {
      return loadRunner(currentPlugin)
          .then(function(d) {
            return build()
        })
    }
    return plugins
  }

  return build()

}
function startIterator(plugins) {

}
function stopIterator(plugins) {

}

function iteratePlugins(iterator) {
  var plugins = instance.groupedPlugins
  //Load core, dependency and platform plugins, in that order.
  var p = {name: 'Platform', plugins: plugins['platform']};
  var d = {name: 'Dependency', plugins: plugins['dependency']};
  var c = {name: 'Core', plugins: plugins['core']};
  var pluginArr = _.filter([p, d, c], function(v) {
    return v.plugins
  })

  var index = pluginArr.length - 1;
  function iterate(){
    var currentPlugin = pluginArr[index]
    index -= 1;
    if(currentPlugin) {
      return loadRunner(currentPlugin)
        .then(function(d) {
          return iterate()
        })
    }
    return pluginArr
  }

  return iterate()
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
