# Kickq Vitals

Monitors the vitals of the [Kickq Queueing System][kickq].

## Install

```shell
npm install kickq --save-dev
```

## What Vitals are Monitored

*Kickq Vitals* will emit events about the following vitals:

* Average processing time. (per job and total)
* Errors occured.
* New Jobs created.
* Jobs queued to be processed. (per job and total)
* Jobs completed successfully.
* Jobs completed with error.
* Jobs timing out and becoming ghosts.

## The API

### Function `listen(fn, optInterval)`

* **Argument**: `fn` **Type**: `Function(Object)` **Default**: **Required!**
* **Argument**: `optInterval` **Type**: `Number` **Default**: `300000` milliseconds (5')

By invoking the `listen()` function Kickq Vitals starts collecting data and invokes the callback in the defined or default interval.

#### vitals.listen() Callback Data Object

The event callback will contain an Object Literal with the following structure:

```js
{
  time: 1364226587925, // {number} JS timestamp.
  period: 300000, // {number} the period in ms.
  errors: {
    db: 0, // {number} database error count
    app: 0 // {number} kickq application errors
  },

  // Measures only the jobs created during the period.
  jobStats: {
    created: 0,
    processed: 0,
    success: 0,
    failed: 0,
    ghosts: 0,
    avgProcessingTime: 0.0
  },
  jobQueues: {
    // The Job's name as key
    "a job": {

      // the same object struct as "jobStats"
      created: 0,
      processed: 0,
      success: 0,
      failed: 0,
      ghosts: 0,
      avgProcessingTime: 0.0
    }
  }
}
```

### Function `stop()`

Stop Kickq Vitals from collecting data.

### Example

```js
var vitals = require('kickq-vitals');

// listen for vitals every 5 minutes
vitals.listen(fn, 300000);

function fn(vitals) {
  console.log('vitals: ', vitals);
}

/* ... */

// stop listening
vitals.stop();
```


## Authors

* [@thanpolas][thanpolas]

## Release History
- **v0.0.1**, *23 Apr 2013*
  - Big Bang

## License
Copyright 2012 Verbling (Fluency Forums Corporation)

Licensed under the [MIT License](LICENSE-MIT)

[grunt]: http://gruntjs.com/
[Getting Started]: https://github.com/gruntjs/grunt/wiki/Getting-started
[Gruntfile]: https://github.com/gruntjs/grunt/wiki/Sample-Gruntfile "Grunt's Gruntfile.js"
[grunt-replace]: https://github.com/erickrdch/grunt-string-replace "Grunt string replace"
[grunt-S3]: https://github.com/pifantastic/grunt-s3 "grunt-s3 task"
[thanpolas]: https://github.com/thanpolas "Thanasis Polychronakis"
[kickq]: https://github.com/verbling-kickq "Kickq Queueing System"
