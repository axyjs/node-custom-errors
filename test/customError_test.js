"use strict";

var customErrors = require("./../src/customErrors.js");

module.exports.testCreate = function (test) {
    var CustomE = customErrors.create("CustomE");
    try {
        throw new CustomE("message");
    } catch (e) {
        test.ok(e instanceof CustomE);
        test.ok(e instanceof Error);
        test.equals(e.message, "message");
        test.equals(e.name, "CustomE");
    }
    test.done();
};

module.exports.testCreateInherit = function (test) {
    var One = customErrors.create("One", TypeError),
        Two = customErrors.create("Two", One),
        Three = Two.inherit("Three"),
        e = new Three();
    test.ok(e instanceof Error);
    test.ok(e instanceof TypeError);
    test.ok(e instanceof One);
    test.ok(e instanceof Two);
    test.ok(e instanceof Three);
    test.done();
};

module.exports.testCreateMessage = function (test) {
    var CustomE = customErrors.create("CustomE", Error, "default message"),
        e1 = new CustomE(),
        e2 = new CustomE("message");
    test.equals(e1.message, "default message");
    test.equals(e2.message, "message");
    test.done();
};

module.exports.testCreateStack = function (test) {
    var CustomE = customErrors.create("CustomE"),
        stack = (new Error()).stack.split("\n"),
        e = new CustomE("msg"),
        estack = e.stack.split("\n");
    test.equals(estack[0], "CustomE: msg");
    test.equals(estack[1].split("(")[0], stack[1].split("(")[0]);
    test.equals(estack.slice(2, 5).join("\n"), stack.slice(2, 5).join("\n"));
    test.done();
};

module.exports.testCreateAbstract = function (test) {
    var Base = customErrors.create("Base", Error, null, true),
        Concrete = Base.inherit(Base, "def"),
        e = new Concrete();
    test.equals(e.message, "def");
    test.ok(e instanceof Base);
    try {
        e = new Base();
        test.ok(false, "Base throws AbstractError");
    } catch (e) {
        test.ok(e instanceof customErrors.AbstractError);
    }
    test.done();
};
