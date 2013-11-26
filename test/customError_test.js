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
    test.throws(function () {
        e = new Base();
    }, customErrors.AbstractError);
    test.done();
};

module.exports.testBlockCreate = function (test) {
    /* jshint maxstatements: 30 */
    var errors, block, e;
    errors = {
        "One": true,
        "Two": "One",
        "Three": false,
        "Four": TypeError,
        "Five": ["One", "def message"],
        "Six": [true, "", true]
    };
    block = new customErrors.Block(errors, "my.ns");
    test.ok(block.created);
    test.equals(typeof block.Base, "function");
    test.equals(typeof block.One, "function");
    test.equals(typeof block.Two, "function");
    test.equals(typeof block.Three, "function");
    test.equals(typeof block.Four, "function");
    test.equals(typeof block.Five, "function");
    e = new block.Two();
    test.ok(e instanceof Error);
    test.ok(e instanceof block.Base);
    test.ok(e instanceof block.One);
    test.ok(e instanceof block.Two);
    test.equals(e.name, "my.ns.Two");
    e = new block.Three();
    test.ok(e instanceof Error);
    test.ok(!(e instanceof block.Base));
    e = new block.Five();
    test.ok(e instanceof block.One);
    test.equals(e.message, "def message");
    test.equals(block.Four, TypeError);
    test.throws(function () {
        e = new block.Base();
    }, customErrors.AbstractError);
    test.throws(function () {
        e = new block.Six();
    }, customErrors.AbstractError);
    test.done();
};

module.exports.testBlockGetAndRaise = function (test) {
    var errors, block;
    errors = {
        "One": true,
        "Two": "One"
    };
    block = new customErrors.Block(errors, "my.ns");
    test.equals(block.get("Two"), block.Two);
    test.throws(function () {
        block.raise("Two", "two message");
    }, block.Two, "two message");
    test.throws(function () {
        block.get("three");
    }, customErrors.Block.ErrorNotFound);
    test.throws(function () {
        block.raise("Three", "three message");
    }, customErrors.Block.ErrorNotFound);
    test.done();
};

module.exports.testLazy = function (test) {
    /* jshint maxstatements: 30 */
    var errors, block, e, Two;
    errors = {
        "One": true,
        "Two": "One",
        "Three": true
    };
    block = new customErrors.Block(errors, "", true, true);
    test.ok(!block.created);
    test.ok(!block.Base);
    test.ok(!block.One);
    test.ok(!block.Two);
    test.ok(!block.Three);
    Two = block.get("Two");
    e = new Two();
    test.ok(!block.created);
    test.ok(block.Base);
    test.ok(block.One);
    test.ok(block.Two);
    test.ok(!block.Three);
    test.ok(e instanceof block.Base);
    test.ok(e instanceof block.One);
    test.ok(e instanceof block.Two);
    block.createAll();
    test.ok(block.created);
    test.ok(block.Base);
    test.ok(block.One);
    test.ok(block.Two);
    test.ok(block.Three);
    test.ok(e instanceof block.Base);
    test.ok(e instanceof block.One);
    test.ok(e instanceof block.Two);
    test.ok(!(e instanceof block.Three));
    test.done();
};

module.exports.testBlockErrorFormat = function (test) {
    var errors;
    errors = {
        "One": true,
        "Two": "three"
    };
    test.throws(function () {
        return new customErrors.Block(errors);
    }, customErrors.Block.ErrorNotFound);
    test.done();
};

module.exports.testBlockOtherBase = function (test) {
    var errors, block, e;
    errors = {
        "One": true,
        "Two": "One"
    };
    block = new customErrors.Block(errors, "", "Root");
    test.ok(!block.Base);
    test.ok(block.Root);
    e = new block.Two();
    test.ok(e instanceof block.Root);
    test.done();
};

module.exports.testBlockWithoutBase = function (test) {
    var errors, block, e;
    errors = {
        "One": true,
        "Two": "One"
    };
    block = new customErrors.Block(errors, "", TypeError);
    test.ok(!block.Base);
    e = new block.Two();
    test.ok(e instanceof TypeError);
    test.done();
};
