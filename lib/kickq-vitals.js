/**
 * @fileoverview The exposed kickq-vitals API.
 */

var EventEmitter = require('events').EventEmitter;
var logg = require('logg');
var log = logg.getLogger('kickq.ctrl.metrics');

var VitalsModel = require('./vitals.model');

var vitals = module.exports = new EventEmitter();

var vitalsModel = VitalsModel.getSingleton();

// listeners count
var listeners = {
  vitals: 0
};

var vitalsOn = false;

/**
 * Listen for vital events
 *
 * @param  {Function} cb The callback.
 * @param  {number=} optPeriod Optionally define setInterval period in ms.
 */
vitals.listen = function(cb, optPeriod) {
  vitals.on('vitals', cb);

  if (optPeriod) {
    vitalsModel.setPeriod(optPeriod);
  }
};

/**
 * Stop monitoring vitals.
 *
 * @param {Function=} optCb Optionally define a specific callback.
 */
vitals.stop = function(optCb) {
  if (optCb) {
    vitals.removeListener('vitals', optCb);
  } else {
    vitals.removeAllListeners('vitals');
  }
};

/**
 * Triggers whenever a new listener is added.
 *
 * @param {string} eventType The event type.
 * @private
 */
vitals._onNewListener = function(eventType) {
  log.info('_onNewListener() :: type:', eventType);

  switch(eventType) {
  case 'vitals':
    listeners.vitals++;
    vitals._vitalsStart();
    break;
  }
};

/**
 * Triggers whenever a new listener is removed.
 *
 * @param {string} eventType The event type.
 * @param {boolean=} optAll if removeAll was invoked.
 * @private
 */
vitals._onRemoveListener = function(eventType, optAll) {
  log.info('_onRemoveListener() :: type:', eventType);

  if (optAll) {
    listeners.vitals = 0;
    vitals._vitalsStop();
    return;
  }

  switch(eventType) {
  case 'vitals':
    if (0 === listeners.vitals) {
      break;
    }

    listeners.vitals--;

    if (0 === listeners.vitals) {
      vitals._vitalsStop();
    }
    break;
  }

};


/**
 * Override EventEmitter's "removeListener" and "removeAllListeners" methods
 * so it can be observed.
 *
 * The "removeListener" event is only available on node >= v0.10.x
 * https://github.com/joyent/node/issues/4977#issuecomment-14746336
 *
 * TODO When supporting lower node versions does not make sense anymore, switch
 *      to listening on the "removeListener" event.
 *
 * @param {string} eventType The event type.
 * @param {Function} fn callback.
 * @return {Object}
 * @override
 */
vitals.removeListener = function(eventType) {
  vitals._onRemoveListener(eventType);
  return EventEmitter.prototype.removeListener.apply(this, arguments);
};
vitals.removeAllListeners = function(eventType) {
  vitals._onRemoveListener(eventType, true);
  return EventEmitter.prototype.removeAllListeners.apply(this, arguments);
};

// TODO When supporting lower node versions does not make sense anymore, switch
//      to listening on the "removeListener" event.
// vitals.on('removeListener', vitals._onRemoveListener);

vitals.on('newListener', vitals._onNewListener);

/**
 * Start monitoring vitals.
 *
 * @private
 */
vitals._vitalsStart = function(){
  if (vitalsOn) {return;}
  vitalsOn = true;

  vitalsModel.start();
};
/**
 * Stop monitoring vitals.
 *
 * @private
 */
vitals._vitalsStop = function(){
  if (!vitalsOn) {return;}
  vitalsOn = false;

  vitalsModel.stop();
};
