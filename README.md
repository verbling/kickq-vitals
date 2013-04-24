# Kickq Vitals

Monitors the vitals of the [Kickq Queueing System][kickq].

## Install

```shell
npm install kickq-vitals --save
```


## The API

### Function `listen(fn, optInterval)`

* **Argument**: `fn` **Type**: `Function(Object)` **Default**: **Required!**
* **Argument**: `optInterval` **Type**: `Number` **Default**: `300000` milliseconds (5')

By invoking the `listen()` function Kickq Vitals starts collecting data and invokes the callback in the defined or default interval. The interval time affects any listeners that hook on `listen()`, the latest listener with an interval value overwrites all.

### Function `stop(optCb)`

Stop Kickq Vitals from collecting data. Optionally define a specific function instead of all the listeners.

## Configuration

kickq-vitals can be configured using the `config()` function, adding an Object with key-value pairs or a single key, value pair:

```js
vitals.config({key: value, otherKey: otherValue});

vitals.config(key, value);
```

### Configuration Options

#### Option :: `logfile`

**Type**: `boolean` **Default**: `false`

Log vitals to files.


#### Option :: `logpath`

**Type**: `string` **Default**: `./log`

kickq-vitals requires a folder to start saving the logfiles.

## Examples

Start monitoring vitals using a callback

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

Start monitoring vitals using a logfile

```js
var vitals = require('kickq-vitals');

// define the log folder
vitals.config('logpath', './logs');

// start logging to file
vitals.config('logfile', true);

/* ... */

// stop logging to file
vitals.config('logfile', false);
```


## What Vitals are Monitored

The vitals.listen() will provide as an argument an Object Literal with the following structure:

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
[kickq]: https://github.com/verbling/kickq "Kickq Queueing System"
