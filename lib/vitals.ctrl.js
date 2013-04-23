/**
 * @fileoverview VitalsCtrl controller, will listen for kickq metric events that
 *               concern the system vitals.
 */
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var _ = require('underscore');
var kickq = require('kickq');

var log = kickq.logg.getLogger('kickq-vitals.ctrl.VitalsCtrl');

var vitalsModel = require('./vitals.model').getInstance();

/**
 * Will listen for kickq metric events that concern the system vitals.
 *
 * @constructor
 * @extends {events.EventEmitter}
 */
var VitalsCtrl = module.exports = function() {
  log.fine('Ctor() :: Init');

  EventEmitter.call(this);

  /** @type {boolean} If vitals monitoring is on */
  this._isOn = false;

  /** @type {?Object} setInterval index */
  this._setInterval = null;

  /** @type {number} Default interval period is 5' */
  this._period = 300000;

  /** @type {number} Listener count */
  this._listeners = 0;

  /** @type {number} JS timestamp, the starting time of this period. */
  this._startTime = 0;


  // TODO When supporting lower node versions does not make sense anymore, switch
  //      to listening on the "removeListener" event.
  // vitals.on('removeListener', vitals._onRemoveListener);
  this.on('newListener', this._onNewListener.bind(this));

};
util.inherits(VitalsCtrl, EventEmitter);
kickq.util.addSingletonGetter(VitalsCtrl);

/**
 * Start listening to kickq metrics events.
 *
 */
VitalsCtrl.prototype.start = function() {
  if (this._isOn) {return;}
  this._isOn = true;

  kickq.metrics.on('metrics', this._onMetricEvent.bind(this));

  // start ticking
  this._startTime = Date.now();
  this._setInterval = setInterval(this._onInterval.bind(this), this._period);
  vitalsModel.clear();
};

/**
 * Stop listening to kickq metrics events
 *
 */
VitalsCtrl.prototype.stop = function() {
  if (!this._isOn) {return;}
  this._isOn = false;

  kickq.metrics.removeListener('metrics', this._onMetricEvent.bind(this));
  clearInterval(this._setInterval);
  vitalsModel.clear();
};

/**
 * Triggers on kickq publishing a metrics event.
 *
 * @param {string} eventType the metric event type.
 * @param {Object} publicJobItem The Job Item public data object.
 * @private
 */
VitalsCtrl.prototype._onMetricEvent = function(eventType, publicJobItem) {
  if (!this._isOn) {return;}

  vitalsModel.feed(eventType, publicJobItem);
};

/**
 * Set the interval period.
 * @param {number} val the interval in ms.
 */
VitalsCtrl.prototype.setPeriod = function(val) {
  if (!_.isNumber(val) || !val) {
    return;
  }

  this._period = val;

  // restart the clock...
  if (this._isOn) {
    clearInterval(this._setInterval);
    this._setInterval = setInterval(this._onInterval.bind(this), this._period);
  }
};

/**
 * Ticks on each interval.
 *
 * @private
 */
VitalsCtrl.prototype._onInterval = function() {
  log.fine('_onInterval() :: Init.');

  var vitalItem = vitalsModel.interval(this._startTime, this._period);
  this._startTime = Date.now();
  log.finer('_onInterval() :: Model finished. ', vitalItem);
  this.emit('vitals', vitalItem);
};


/**
 * Triggers whenever a new listener is added.
 *
 * @param {string} eventType The event type.
 * @private
 */
VitalsCtrl.prototype._onNewListener = function(eventType) {
  log.info('_onNewListener() :: type:', eventType);

  switch(eventType) {
  case 'vitals':
    this._listeners++;
    this.start();
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
VitalsCtrl.prototype._onRemoveListener = function(eventType, optAll) {
  log.info('_onRemoveListener() :: type:', eventType);

  if (optAll) {
    this._listeners = 0;
    this.stop();
    return;
  }

  switch(eventType) {
  case 'vitals':
    if (0 === this._listeners) {
      break;
    }

    this._listeners--;

    if (0 === this._listeners) {
      this.stop();
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
VitalsCtrl.prototype.removeListener = function(eventType) {
  this._onRemoveListener(eventType);
  return EventEmitter.prototype.removeListener.apply(this, arguments);
};
VitalsCtrl.prototype.removeAllListeners = function(eventType) {
  this._onRemoveListener(eventType, true);
  return EventEmitter.prototype.removeAllListeners.apply(this, arguments);
};
