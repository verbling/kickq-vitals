/**
 * @fileoverview The exposed kickq-vitals API.
 */

// check if kickq is there
var kickq;
try {
  kickq = require('kickq');
} catch(ex) {
  console.log('\nError! "kickq" module not found.\n');
  throw ex;
}

var logg = kickq.logg;
var log = logg.getLogger('kickq-vitals.main');

var vitalsCtrl = require('./vitals.ctrl').getInstance();

// cheat, extend the controller
var vitals = module.exports = vitalsCtrl;

// contains all the listeners
var listeners = [];

/**
 * Listen for vital events
 *
 * @param  {Function} cb The callback.
 * @param  {number=} optPeriod Optionally define setInterval period in ms.
 */
vitals.listen = function(cb, optPeriod) {
  log.fine('listen() :: Init.');

  vitalsCtrl.on('vitals', cb);

  listeners.push(cb);

  if (optPeriod) {
    vitalsCtrl.setPeriod(optPeriod);
  }
};

/**
 * Stop monitoring vitals.
 *
 * @param {Function=} optCb Optionally define a specific callback.
 * @return {boolean} If any listeners removed.
 */
vitals.stop = function(optCb) {
  log.fine('stop() :: Init. Has optCb:', !!optCb);

  if (optCb) {
    var index = listeners.indexOf(optCb);
    if ( -1 === index) {
      return false;
    }

    // remove that listener from the listeners collection.
    listeners.splice(index, 1);

    vitalsCtrl.removeListener('vitals', optCb);
  } else {
    listeners.forEach(vitalsCtrl.removeListener.bind(vitalsCtrl, 'vitals'));
  }

  return true;
};

