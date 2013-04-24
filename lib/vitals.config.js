/**
 * @fileoverview Configuration module for kickq-vitals
 *
 */
var EventEmitter = require('events').EventEmitter;
var Map = require('collections/map');
var _ = require('underscore');

var config = module.exports = new EventEmitter();

config.setMaxListeners(30);

/**
 * Default config values.
 * @const {Object}
 */
var DEFAULT = {
  logToFile: false,
  logpath: './log',
  logFilename: 'kickq-vitals.log',
  logSaveQueues: true,
  logQueuePrefix: 'queue-'
};

var map = new Map(DEFAULT);

// listen for changes and emit event
map.addMapChangeListener(function(value, key){
  config.emit(key, key, value);
});

/**
 * Define values for the config
 *
 * @param {Object|string} confObj Config object or config key.
 * @param {*=} optValue value of config if confObj is string.
 */
config.set = function(confObj, optValue) {
  if ( _.isObject(confObj) ) {
    map.addEach(confObj);
    return;
  }

  if ( _.isString(confObj) ) {
    map.set(confObj, optValue);
    return;
  }

  throw new TypeError('Argument not of type Object or String');
};


/**
 * Return the value of a configuration parameter.
 *
 * @param  {string} key The key.
 * @return {*} whatever.
 */
config.get = function(key) {
  return map.get(key);
};


/**
 * Helper for geting job specific options that exist in the "jobFlags" Object.
 *
 * @param  {string} jobName The job name.
 * @return {Object} Will always return an object, empty if nothing defined.
 */
config.getJob = function(jobName) {
  var jobFlags = config.get('jobFlags');

  if ( _.isObject(jobFlags[jobName]) ) {
    return jobFlags[jobName];
  }
  return {};
};

/**
 * Reset the config to its original state, remove all listeners.
 *
 */
config.reset = function() {
  map.clear();
  map.addEach(DEFAULT);
};
