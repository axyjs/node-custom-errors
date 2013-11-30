/**
 * Test: class Block
 */
"use strict";

var ce = require("../index.js");

module.exports = {

    testCreateTrue: function (test) {
        var errors = {
                "One": true
            },
            block = new ce.Block(errors),
            e;
        test.ok(block.created);
        test.equals(typeof block.Base, "function");
        test.equals(typeof block.One, "function");
        e = new block.One();
        test.ok(e instanceof block.Base);
        test.done();
    },

    testCreateFalse: function (test) {
        var errors = {
                "One": true,
                "Two": false,
            },
            block = new ce.Block(errors),
            e;
        test.equals(typeof block.Two, "function");
        e = new block.Two();
        test.ok(!(e instanceof block.Base));
        test.done();
    },

    testCreateParentName: function (test) {
        var errors = {
                "One": true,
                "Two": "One"
            },
            block = new ce.Block(errors),
            e;
        test.equals(typeof block.One, "function");
        e = new block.Two();
        test.ok(e instanceof block.One);
        test.notEqual(block.One, block.Two);
        test.done();
    },

    testCreateDirectly: function (test) {
        var errors = {
                "One": TypeError
            },
            block = new ce.Block(errors);
        test.equals(block.One, TypeError);
        test.done();
    },

    testCreateList: function (test) {
        var errors = {
                "One": true,
                "Two": ["One", "def message"]
            },
            block = new ce.Block(errors),
            e = new block.Two();
        test.ok(e instanceof block.One);
        test.equals(e.name, "Two");
        test.equals(e.message, "def message");
        test.done();
    },

    testCreateDict: function (test) {
        var errors = {
                "One": {
                    abstract: true
                },
                "Two": {
                    parent: "One",
                    construct: function (a) {
                        this.message = "" + (a * 2);
                    }
                }
            },
            block = new ce.Block(errors),
            e = new block.Two(2);
        test.ok(e instanceof block.One);
        test.equals(e.message, "4");
        test.throws(function () {
            return new block.One();
        }, ce.AbstractError);
        test.done();
    },

    testNamespace: function (test) {
        var errors = {
                "One": true,
                "Two": false,
                "Three": ce.create("Three"),
                "Four": ["Two", "defmessage"],
                "Five": {
                    name: "nFive"
                }
            },
            block = new ce.Block(errors, "my.errors");
        test.equals((new block.One()).name, "my.errors.One");
        test.equals((new block.Two()).name, "my.errors.Two");
        test.equals((new block.Three()).name, "Three");
        test.equals((new block.Four()).name, "my.errors.Four");
        test.equals((new block.Five()).name, "my.errors.Five");
        test.done();
    },

    testGet: function (test) {
        var errors = {
                "One": true
            },
            block = new ce.Block(errors);
        test.equals(block.get("One"), block.One);
        test.equals(block.get("Base"), block.Base);
        test.throws(function () {
            block.get("Two");
        }, ce.Block.ErrorNotFound);
        test.done();
    },

    testRaise: function (test) {
        var errors = {
                "One": true
            },
            block = new ce.Block(errors);
        test.throws(function () {
            block.raise("Base");
        }, ce.AbstractError);
        test.throws(function () {
            block.raise("One");
        }, block.One);
        test.throws(function () {
            block.raise("Two");
        }, ce.Block.ErrorNotFound);
        test.done();
    },

    testLazy: function (test) {
        /* jshint maxstatements: 30 */
        var errors = {
                "One": true,
                "Two": "One",
                "Three": true
            },
            block = new ce.Block(errors, "", true, true),
            Two,
            e;
        test.ok(!block.created);
        test.ok(!block.Base);
        test.ok(!block.One);
        test.ok(!block.Two);
        test.ok(!block.Three);
        Two = block.get("Two");
        test.ok(!block.created);
        test.ok(block.Base);
        test.ok(block.One);
        test.ok(block.Two);
        test.ok(!block.Three);
        e = new Two();
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
    },

    testInvalidFormat: function (test) {
        var errors;
        errors = {
            "One": true,
            "Two": "three"
        };
        test.throws(function () {
            return new ce.Block(errors);
        }, ce.Block.ErrorNotFound);
        test.done();
    },

    testBaseRename: function (test) {
        var errors = {
                "One": true
            },
            block = new ce.Block(errors, "", "Root"),
            e = new block.One();
        test.ok(!block.Base);
        test.ok(block.Root);
        test.ok(e instanceof block.Root);
        test.done();
    },

    testBaseNone: function (test) {
        var errors, block, e;
        errors = {
            "One": true,
            "Two": "One"
        };
        block = new ce.Block(errors, "", TypeError);
        test.ok(!block.Base);
        e = new block.Two();
        test.ok(e instanceof TypeError);
        test.done();
    },

    testLazyGetBase: function (test) {
        var errors = {
                One: true
            },
            block = new ce.Block(errors, "ns", null),
            Base = block.get("Base"),
            One,
            e;
        test.equals(typeof Base, "function");
        One = block.get("One");
        e = new One();
        test.ok(e instanceof Base);
        test.equals(block.Base, Base);
        block = new ce.Block(errors, "ns", "Root");
        test.throws(function () {
            block.get("Base");
        }, ce.Block.ErrorNotFound());
        Base = block.get("Root");
        test.equals(typeof Base, "function");
        One = block.get("One");
        e = new One();
        test.ok(e instanceof Base);
        test.equals(block.Root, Base);
        test.done();
    }
};
