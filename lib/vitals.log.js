/**
 * @fileoverview Save the vitals to a log file.
 */
var fs = require('fs');
var path = require('path');

var slug = require ('slug');
var _ = require('underscore');
var kickq = require('kickq');
var log = kickq.logg.getLogger('kickq-vitals.logfile');

var kconfig = require('./vitals.config');
var vitalsCtrl = require('./vitals.ctrl').getInstance();

/**
 * The kickq-vitals log to file class.
 *
 * @constructor
 */
var Log = module.exports = function() {

  /** @type {boolean} If logging to file is on */
  this._isOn = false;

  this._logpath = kconfig.get('logpath');
  this._logFilename = kconfig.get('logFilename');
  this._logSaveQueues = kconfig.get('logSaveQueues');
  this._logQueuePrefix = kconfig.get('logQueuePrefix');

  kconfig.on('logToFile', this._onConfigChange.bind(this));
  kconfig.on('logpath', this._onConfigChange.bind(this));
  kconfig.on('logFilename', this._onConfigChange.bind(this));
  kconfig.on('logSaveQueues', this._onConfigChange.bind(this));
  kconfig.on('logQueuePrefix', this._onConfigChange.bind(this));
};
kickq.util.addSingletonGetter(Log);


/**
 * Triggers when config changes and updates internal values.
 *
 * @param {string} key The key that changed.
 * @param {*} value The new value.
 * @private
 */
Log.prototype._onConfigChange = function(key, value) {
  log.fine('_onConfigChange() :: Init. key, value: ', key, value );
  switch(key) {
  case 'logToFile':
    if (value) {
      this.start();
    } else {
      this.stop();
    }
    break;
  case 'logpath':
    this._logpath = value;
    break;
  case 'logFilename':
    this._logFilename = value;
    break;
  case 'logSaveQueues':
    this._logSaveQueues = value;
    break;
  case 'logQueuePrefix':
    this._logQueuePrefix = value;
    break;
  }
};

/**
 * Start logging to files.
 *
 */
Log.prototype.start = function() {
  if (this._isOn) {return;}

  if (!this._checkLogpath()) {return;}

  this._isOn = true;

  vitalsCtrl.on('vitals', this._onVitals.bind(this));
};

Log.prototype.stop = function() {
  if (!this._isOn) {return;}
  this._isOn = false;


  vitalsCtrl.removeListener('vitals', this._onVitals.bind(this));
};

/**
 * Triggers on vitals event.
 *
 * @param  {kickq-vitals.model.VitalsItem} vitalsItem The vitals data object
 * @private
 */
Log.prototype._onVitals = function(vitalsItem) {
  log.fine('_onVitals() :: Init. _isOn, Created Jobs: ', this._isOn, vitalsItem.jobStats.created);
  if (!this._isOn) {return;}

  this._saveVitals(vitalsItem, function(err) {
    if (err) {
      log.error('Could not append to file! Error:', err);
    }
    if (this._logSaveQueues) {
      this._saveQueueVitals(vitalsItem);
    }
  }.bind(this));
};

/**
 * Check that the log path is there and writable.
 *
 * @private
 * @return {boolean}
 */
Log.prototype._checkLogpath = function() {
  if (kickq.file.isDir(this._logpath)) {
    return true;
  }

  if (kickq.file.exists(this._logpath)) {
    console.log('Logpath exists and is not a directory: ', this._logpath);
    return false;
  }

  try {
    kickq.file.mkdir(this._logpath);
  } catch(ex) {
    console.log('Failed to create directory: ', this._logpath);
    console.log('Exception: \n', ex);
    return false;
  }

  return true;
};

/**
 * Save the main vitals to file.
 *
 * @param {kickq-vitals.model.VitalsItem} vitalsItem The vitals data object
 * @param {Function(err)} cb Callback when done
 * @private
 */
Log.prototype._saveVitals = function(vitalsItem, cb) {
  var out = [];

  var dt = new Date(vitalsItem.time);

  var strDate = getDateString(dt);

  out.push(strDate);
  out.push('[vitals-main]');
  out.push('period:' + vitalsItem.period);
  out.push('db-errors:' + vitalsItem.errors.db);
  out.push('app-errors:' + vitalsItem.errors.app);
  out.push('created:' + vitalsItem.jobStats.created);
  out.push('processed:' + vitalsItem.jobStats.processed);
  out.push('success:' + vitalsItem.jobStats.success);
  out.push('failed:' + vitalsItem.jobStats.failed);
  out.push('ghosts:' + vitalsItem.jobStats.ghosts);
  out.push('avgProcessingTime:' + vitalsItem.jobStats.avgProcessingTime);


  var strOut = out.join(' ');
  strOut += '\n';

  var filename = path.join(this._logpath, this._logFilename);

  try {

    fs.appendFile(filename, strOut, cb);

  } catch (ex) {
    console.log('Failed to write to logfile: ', filename);
    console.log('Aborting logging');
    console.log('Exception:\n', ex);
    throw new Error('Failed to write to logfile');
  }
};

/**
 * Save the vitals per queue to files.
 *
 * @param  {kickq-vitals.model.VitalsItem} vitalsItem The vitals data object
 * @private
 */
Log.prototype._saveQueueVitals = function(vitalsItem) {


  var dt = new Date(vitalsItem.time);

  var strDate = getDateString(dt);

  var out, strOut, filename;
  _.forEach(vitalsItem.jobQueues, function(queueStats, queue) {
    out = [];
    out.push(strDate);
    out.push('[queue: ' + queue + ']');
    out.push('created:' + queueStats.created);
    out.push('processed:' + queueStats.processed);
    out.push('success:' + queueStats.success);
    out.push('failed:' + queueStats.failed);
    out.push('ghosts:' + queueStats.ghosts);
    out.push('avgProcessingTime:' + queueStats.avgProcessingTime);

    strOut = out.join(' ');
    strOut += '\n';

    filename = path.join(this._logpath,
      this._logQueuePrefix + slug(queue) + '.log');

    try {
      fs.appendFile(filename, strOut, function(err){
        if (err) {
          log.warn('_saveQueueVitals() :: fs.appendFile Failed! err: ', err);
        }
      });
    } catch (ex) {
      log.warn('_saveQueueVitals() :: Failed to write to Queue log: ', filename);
    }
  }, this);

};





// funcs from node logg package
// TODO export from logg and re-use

/**
 * Returns a date string in the form yy/mm/dd hh:mm:ss.mmm.
 * @param {Date} d Optional date object to use, other wise creates a new one.
 * @return {string}
 */
function getDateString(d) {
  d = d || new Date;
  return d.getFullYear() + '/' +
         pad(d.getMonth() + 1) + '/' +
         pad(d.getDate()) + ' ' +
         pad(d.getHours()) + ':' +
         pad(d.getMinutes()) + ':' +
         pad(d.getSeconds()) + '.' +
         pad(d.getMilliseconds(), 3);
}


/**
 * Pads a number with leading zeros to ensure it is at least opt_len long.
 * @param {number} n The number to pad.
 * @param {number} opt_num The desired length to pad too, defaults to 2.
 * @return {string}
 */
function pad(n, opt_len) {
  var len = opt_len || 2;
  n = String(n);
  return new Array(len - n.length + 1).join('0') + n;
}
