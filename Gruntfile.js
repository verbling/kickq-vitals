/*jshint camelcase:false */
/*
 * Kickq Vitals
 * Monitors the vitals of the Kickq Queueing System.
 *
 * https://github.com/verbling/kickq-vitals
 *
 * Copyright (c) 2013 Verbling
 * Licensed under the MIT license.
 *
 * Authors:
 *   Thanasis Polychronakis (http://thanpol.as)
 *
 */

var reporterUse;

if ( 'true' === process.env.TRAVIS) {
  reporterUse = 'spec';
} else {
  reporterUse = 'spec';
}

module.exports = function( grunt ) {

  //
  // Grunt configuration:
  //
  //
  grunt.initConfig({});

  grunt.registerTask('default', ['test']);
};

