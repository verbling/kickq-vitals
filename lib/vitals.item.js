/**
 * @fileoverview The Vitals Item object.
 */


/**
 * The Vitals Item object.
 *
 * @param {number=} optPeriod The interval period, required only for show.
 * @return {[type]} [description]
 * @constructor
 */
var VitalsItem = module.exports = function(optPeriod) {
  this.time = Date.now(); // {number} JS timestamp.
  this.period = optPeriod || 300000; // {number} the period in ms.
  this.errors = {
    db: 0, // {number} database error count
    app: 0 // {number} kickq application errors
  };

  // Measures only the jobs created during the period.
  this.jobStats = {
    created: 0,
    processed: 0,
    success: 0,
    failed: 0,
    ghosts: 0,
    avgProcessingTime: 0.0
  };

  /** @type {Object.<VitalItem.QueueStats>} Per queue stats */
  this.jobQueues = {};
};

/**
 * Per queue stats, same at VitalsItem.jobStats
 *
 * @constructor
 */
VitalsItem.QueueStats = function() {
  this.created = 0;
  this.processed = 0;
  this.success = 0;
  this.failed = 0;
  this.ghosts = 0;
  this.avgProcessingTime = 0.0;
};
