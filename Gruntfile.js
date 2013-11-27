"use strict";

module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        jshint: {
            options: {
                jshintrc: ".jshintrc"
            },
            src: "lib/**/*.js",
            test: "test/**/*.js",
            gruntfile: "Gruntfile.js"
        },
        jsonlint: {
            pkg: ["package.json"]
        },
        nodeunit: {
            all: ["test/*_test.js"]
        }
    });

    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-jsonlint");
    grunt.loadNpmTasks("grunt-contrib-nodeunit");

    grunt.registerTask("hint", ["jshint", "jsonlint"]);
    grunt.registerTask("test", ["nodeunit"]);
    grunt.registerTask("default", ["hint", "test"]);
};
