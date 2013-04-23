/**
 * @fileoverview Vitals model, will aggregate and compute the vital information.
 */
var _ = require('underscore');
var kickq = require('kickq');

var log = kickq.logg.getLogger('kickq-vitals.model.Vitals');

var VitalsItem = require('./vitals.item');

/**
 * Will aggregate and compute the vital information.
 *
 * @constructor
 */
var Vitals = module.exports = function() {
  log.fine('Ctor() :: Init');

  /**
   * Contains arrays of the kickq metric events
   * @type {Object}
   * @private
   */
  this._container = {
    create: [],
    queued: [],
    success: [],
    fail: []
  };
};
kickq.util.addSingletonGetter(Vitals);

/**
 * Clear counters
 *
 */
Vitals.prototype.clear = function() {
  this._container.create = [];
  this._container.queued = [];
  this._container.success = [];
  this._container.fail = [];
};

/**
 * A kickq metrics event occured, store it.
 *
 * @param {string} eventType metrics event type.
 * @param {kickq.JobItem} publicJobItem the public job item
 */
Vitals.prototype.feed = function(eventType, publicJobItem) {
  log.info('feed() :: Init. eventType, jobId: ', eventType, publicJobItem.id);

  if (!Array.isArray(this._container[eventType])) {
    return;
  }
  this._container[eventType].push(publicJobItem);
};

/**
 * Marks an interval and forces computation of vitals.
 *
 * Resets the counters
 *
 * @param {number} startTime JS timestamp, the starting time of this period.
 * @param {number} period The interval period.
 * @return {kickq-vitals.model.VitalItem} A vital item.
 */
Vitals.prototype.interval = function(startTime, period) {
  log.fine('interval() :: Init.');

  var vitalsItem = new VitalsItem(period);

  var createLen = this._container.create.length;
  var successLen = this._container.success.length;
  var failLen = this._container.fail.length;

  var successProcessTimes = this.successProcessTimes(startTime);
  var failProcess = this.failProcess(startTime);

  // calculate total processing time
  function sum(a, b){return a+b;}
  var totalProcessItems = successProcessTimes.processTimes.length;
  var totalProcessTime = 0;
  if (totalProcessItems) {
    totalProcessTime = successProcessTimes.processTimes.reduce(sum);
  }




  vitalsItem.jobStats.created = createLen;
  vitalsItem.jobStats.processed = successLen + failLen;
  vitalsItem.jobStats.success = successLen;
  vitalsItem.jobStats.failed = failProcess.processFails;
  vitalsItem.jobStats.ghosts = failProcess.processGhosts;
  vitalsItem.jobStats.avgProcessingTime = Math.floor(
    (totalProcessTime / totalProcessItems) * 100) / 100;

  vitalsItem.jobQueues = this.jobQueues(successProcessTimes, failProcess);

  this.clear();
  return vitalsItem;
};

/**
 * Returns the processing times of successful jobs.
 *
 * @param  {number} startTime JS timestamp, the starting time of this period.
 * @return {Object.<{processTimes:Array, queueProcessTimes:Object.<Array>}>}
 *         An object containing the keys "processTimes" an array of processing
 *         times, and queueProcessTimes (Object of arrays).
 */
Vitals.prototype.successProcessTimes = function(startTime) {
  var processTimes = [];
  var queueProcessTimes = {};

  // collect processing times
  var successJobIds = [];
  this._container.success.forEach(function(publicJobItem) {
    // only handle unique job ids
    if (0 <= successJobIds.indexOf(publicJobItem.id)) {
      return;
    }
    successJobIds.push(publicJobItem.id);

    publicJobItem.runs.forEach(function(processItem) {

      // only care about the period
      if ( startTime > processItem.startTime ){
        return;
      }

      processTimes.push(processItem.processTime);
      queueProcessTimes[publicJobItem.name] =
        queueProcessTimes[publicJobItem.name] || [];
      queueProcessTimes[publicJobItem.name].push(processItem.processTime);

    }, this);
  }, this);

  return {
    processTimes: processTimes,
    queueProcessTimes: queueProcessTimes
  };
};


/**
 * Returns the processing times of successful jobs.
 *
 * @param  {number} startTime JS timestamp, the starting time of this period.
 * @return {Object}
 *         An object containing the keys:
 *         "processTimes": {Array} of process times for all failed jobs
 *           (ghosts excluded).
 *         "queueProcessTimes": {Object.<Array>} An object with the job names
 *           as keys and array of processing time as values.
 *         "processGhosts": {number} Count of ghosts.
 *         "processFails": {number} Count of fails.
 *         "queueProcessGhosts": {Object.<number>} per queue count of ghosts.
 *         "queueProcessFails": {Object.<number>} per queue count of fails.
 */
Vitals.prototype.failProcess = function(startTime) {
  var processTimes = [];
  var queueProcessTimes = {};
  var processGhosts = 0;
  var processFails = 0;
  var queueProcessGhosts = {};
  var queueProcessFails = {};

  // collect processing times and failure reasons
  var failJobIds = [];
  this._container.fail.forEach(function(publicJobItem) {
    // only handle unique job ids
    if (0 <= failJobIds.indexOf(publicJobItem.id)) {
      return;
    }
    failJobIds.push(publicJobItem.id);

    publicJobItem.runs.forEach(function(processItem) {

      // only care about the period
      if ( startTime > processItem.startTime ){
        return;
      }

      // check if ghost
      if (kickq.states.Process.GHOST === processItem.state) {
        processGhosts++;
        queueProcessGhosts[publicJobItem.name] =
          queueProcessGhosts[publicJobItem.name] || 0;
        queueProcessGhosts[publicJobItem.name]++;

        // next loop
        return;
      }

      // only care for failed items
      if (kickq.states.Process.FAIL !== processItem.state) {
        return;
      }

      processTimes.push(processItem.processTime);
      queueProcessTimes[publicJobItem.name] =
        queueProcessTimes[publicJobItem.name] || [];
      queueProcessTimes[publicJobItem.name].push(processItem.processTime);
      processFails++;
      queueProcessFails[publicJobItem.name] =
        queueProcessFails[publicJobItem.name] || 0;
      queueProcessFails[publicJobItem.name]++;


    }, this);
  }, this);

  return {
    processTimes: processTimes,
    queueProcessTimes: queueProcessTimes,
    processGhosts: processGhosts,
    processFails: processFails,
    queueProcessGhosts: queueProcessGhosts,
    queueProcessFails: queueProcessFails
  };
};

/**
 * Calculate stats per queue (job name).
 *
 * @param  {Object} successProcessTimes As see on "successProcessTimes" method.
 * @param  {Object} failProcess As seen on "failProcess" method.
 * @return {Object.<kickq-vitals.model.VitalItem.QueueStats>} The complete
 *   struct for the "jobQueues" vitals item key.
 */
Vitals.prototype.jobQueues = function(successProcessTimes, failProcess) {
  var jobQueues = {};

  function sum(a, b){return a+b;}

  this._container.create.forEach(function(publicJobItem) {
    jobQueues[publicJobItem.name] = jobQueues[publicJobItem.name] ||
      new VitalsItem.QueueStats();

    jobQueues[publicJobItem.name].created++;
  }, this);

  _.forEach(successProcessTimes.queueProcessTimes,
    function(processTimes, queue) {

    jobQueues[queue] = jobQueues[queue] || new VitalsItem.QueueStats();
    var len = processTimes.length;
    jobQueues[queue].processed += len;
    jobQueues[queue].success += len;

    var totalProcessItems = processTimes.length;
    var totalProcessTime = 0;
    if (totalProcessItems) {
      totalProcessTime = processTimes.reduce(sum);
    }

    jobQueues[queue].avgProcessingTime = Math.floor(
      (totalProcessTime / totalProcessItems) * 100) / 100;

  }, this);

  _.forEach(failProcess.queueProcessGhosts,
    function(processCount, queue) {
    jobQueues[queue] = jobQueues[queue] || new VitalsItem.QueueStats();
    jobQueues[queue].ghosts += processCount;
    jobQueues[queue].processed += processCount;
  }, this);

  _.forEach(failProcess.queueProcessFails,
    function(processCount, queue) {
    jobQueues[queue] = jobQueues[queue] || new VitalsItem.QueueStats();
    jobQueues[queue].failed += processCount;
    jobQueues[queue].processed += processCount;
  }, this);

  return jobQueues;
};
