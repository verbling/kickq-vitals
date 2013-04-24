/**
 * @fileoverview Create kickq traffic and monitor vitals
 */

var _ = require('underscore');
var kickq = require('kickq');

// kickq.config('debug', true);
kickq.config('loggerConsole', true);

// kickq.logg.getLogger('kickq-vitals').setLogLevel(kickq.logg.Level.FINE);
kickq.logg.getLogger('kickq-vitals').setLogLevel(kickq.logg.Level.FINEST);

var vitals = require('../../');

vitals.listen(function(vitals){
  console.log('vitals fired! Created: ', vitals.jobStats.created);
}, 1000);

var jobs = [
  'zit-zot-pop',
  'send-email',
  'try me',
  'a spaze'
];

function getRand(low, high) {
  return Math.floor(Math.random() * (high - low + 1)) + low;
}


setInterval(function(){
  var randIndex = getRand(0, 3);
  kickq.create(jobs[randIndex]);
}, 40);

jobs.forEach(function(job){
  kickq.process(job, {concurrentJobs: 20}, function(jobItem, data, cb){
    var outcome = (40 > getRand(0, 100) ? null : 'failed');
    // console.log('outcome: ', outcome, jobItem.id, jobItem.name);

    // create a few ghosts
    var beGhost = 1 > getRand(0, 100);
    if (beGhost) {
      return;
    }

    setTimeout(function(){cb(outcome);}, getRand(5, 30));
  });
});


setTimeout(function(){
  console.log('STOPING STOPING');
  vitals.stop();
}, 2800);

