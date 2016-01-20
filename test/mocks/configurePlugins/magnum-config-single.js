
exports.options = {
  defaultValue: 'ConfigSingle',
  setValue: 'SetConfigSingle'
},

exports.metadata = {
  "name": 'ConfigSingle',
  "layer": "core",
  "inject": "Single",
  "type": 'service'
}

exports.plugin = {
  load: function(inject, loaded) {
    loaded(null, this.options)
  },
  start: function(done) {
    done(null)
  },
  stop: function(done) {
    done(null)
  }
};