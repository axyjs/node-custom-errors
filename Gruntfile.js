"use strict";

module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        jshint: {
            options: {
                jshintrc: ".jshintrc"
            },
            src: "index.js",
            test: "test/**/*.js",
            gruntfile: "Gruntfile.js"
        },
        jsonlint: {
            pkg: ["package.json"],
            hint: [".jshintrc"]
        },
        nodeunit: {
            all: ["test/*_test.js"]
        },
        checkver: {
            options: {
                version: "<%= pkg.version %>"
            }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-jsonlint");
    grunt.loadNpmTasks("grunt-contrib-nodeunit");

    grunt.registerTask("checkver", "Check version", function () {
        var version = this.options().version,
            fs = require("fs"),
            content;
        content = fs.readFileSync("./index.js", {encoding: "utf-8"});
        if (content.indexOf("@version " + version) === -1) {
            grunt.log.error("Invalid version in customErrors.js");
            return false;
        } else {
            grunt.log.writeln("customErrors.js checked");
        }
        content = fs.readFileSync("./README.md", {encoding: "utf-8"});
        if (content.indexOf("Current version: " + version) === -1) {
            grunt.log.error("Invalid version in README.md");
            return false;
        } else {
            grunt.log.writeln("README.md checked");
        }
    });

    grunt.registerTask("hint", ["jshint", "jsonlint", "checkver"]);
    grunt.registerTask("test", ["nodeunit"]);
    grunt.registerTask("default", ["hint", "test"]);
};
