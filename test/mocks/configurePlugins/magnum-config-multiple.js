
module.exports = [
  {
    options: {
      defaultValue: 'ConfigCore',
      setValue: 'SetConfigCore'
    },
    metadata: {
      name: 'ConfigCore',
      type: 'service',
      layer: 'core',
      inject: 'ConfCore'
    },
    plugin: {
      load: function(injector, loaded){
        loaded(null, this.options)
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
    options: {
      defaultValue: 'ConfigData',
      setValue: 'SetConfigData'
    },
    metadata: {
      name: 'ConfigData',
      type: 'service',
      layer: 'data',
      inject: 'ConfData'
    },
    plugin: {
      load: function(injector, loaded){
        loaded(null, this.options);
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
    options: {
      defaultValue: 'ConfigDependency',
      setValue: 'DependencyUnchanged'
    },
    metadata: {
      name: 'ConfigDependency',
      type: 'service',
      layer: 'dependency',
      inject: 'ConfDep'
    },
    plugin: {
      load: function(injector, loaded){
        loaded(null, this.options)
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
      name: 'ConfigPlatform',
      type: 'service',
      layer: 'platform',
      inject: 'ConfPlat'
    },
    plugin: {
      load: function(injector, loaded){
        loaded(null, this.options || {})
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

