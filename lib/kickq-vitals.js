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

// var logg = kickq.logg;
// var log = logg.getLogger('kickq-vitals.main');

var vitalsCtrl = require('./vitals.ctrl').getInstance();

// cheat, extend the controller
var vitals = module.exports = vitalsCtrl;

/**
 * Listen for vital events
 *
 * @param  {Function} cb The callback.
 * @param  {number=} optPeriod Optionally define setInterval period in ms.
 */
vitals.listen = function(cb, optPeriod) {
  vitalsCtrl.on('vitals', cb);

  if (optPeriod) {
    vitalsCtrl.setPeriod(optPeriod);
  }
};

/**
 * Stop monitoring vitals.
 *
 * @param {Function=} optCb Optionally define a specific callback.
 */
vitals.stop = function(optCb) {
  if (optCb) {
    vitalsCtrl.removeListener('vitals', optCb);
  } else {
    vitalsCtrl.removeAllListeners('vitals');
  }
};

