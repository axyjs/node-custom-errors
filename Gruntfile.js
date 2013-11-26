"use strict";

var ce = require("./src/customErrors.js");

module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        jshint: {
            options: {
                jshintrc: ".jshintrc"
            },
            src: {
                src: "src/**/*.js"
            }
        },
        jsonlint: {
            pkg: {
                src: ["package.json"]
            }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-jsonlint");

    grunt.registerTask("hint", ["jshint", "jsonlint"]);
    grunt.registerTask("default", ["hint"]);
};
