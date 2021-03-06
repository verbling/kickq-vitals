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

  grunt.loadNpmTasks('grunt-release');

  //
  // Grunt configuration:
  //
  //
  grunt.initConfig({

    release: {
      options: {
        bump: true, //default: true
        file: 'package.json', //default: package.json
        add: true, //default: true
        commit: true, //default: true
        tag: true, //default: true
        push: true, //default: true
        pushTags: true, //default: true
        npm: true, //default: true
        tagName: 'v<%= version %>', //default: '<%= version %>'
        commitMessage: 'releasing v<%= version %>', //default: 'release <%= version %>'
        tagMessage: 'v<%= version %>' //default: 'Version <%= version %>'
      }
    }
  });

  grunt.registerTask('default', ['test']);
};

