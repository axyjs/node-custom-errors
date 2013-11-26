"use strict";

var customErrors = require("./../src/customErrors.js");

module.exports.testContents = function (test) {
    test.equals(typeof customErrors.create, "function");
    test.done();
};