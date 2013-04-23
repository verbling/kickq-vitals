/**
 * @fileoverview Create kickq traffic and monitor vitals
 */

var _ = require('underscore');
var kickq = require('kickq');

// kickq.config('debug', true);
kickq.config('loggerConsole', true);

// kickq.logg.getLogger('kickq-vitals').setLogLevel(0);


var vitals = require('../../');

vitals.listen(function(vitals){
  console.log('vitals fired:\n', vitals);
}, 2000);

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
},600);

jobs.forEach(function(job){
  kickq.process(job, function(jobItem, data, cb){
    var outcome = (40 > getRand(0, 100) ? null : 'failed');
    // console.log('outcome: ', outcome, jobItem.id, jobItem.name);
    setTimeout(function(){cb(outcome);}, getRand(100, 600));
  });
});

