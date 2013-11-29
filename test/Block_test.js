/**
 * Test: class Block
 */
"use strict";

var ce = require("../");

module.exports = {
    testCreate: function (test) {
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
        block = new ce.Block(errors, "my.ns");
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
        }, ce.AbstractError);
        test.throws(function () {
            e = new block.Six();
        }, ce.AbstractError);
        test.done();
    },

    testGetAndRaise: function (test) {
        var errors, block;
        errors = {
            "One": true,
            "Two": "One"
        };
        block = new ce.Block(errors, "my.ns");
        test.equals(block.get("Two"), block.Two);
        test.throws(function () {
            block.raise("Two", "two message");
        }, block.Two, "two message");
        test.throws(function () {
            block.get("three");
        }, ce.Block.ErrorNotFound);
        test.throws(function () {
            block.raise("Three", "three message");
        }, ce.Block.ErrorNotFound);
        test.done();
    },

    testLazy: function (test) {
        /* jshint maxstatements: 30 */
        var errors, block, e, Two;
        errors = {
            "One": true,
            "Two": "One",
            "Three": true
        };
        block = new ce.Block(errors, "", true, true);
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

    testOtherBase: function (test) {
        var errors, block, e;
        errors = {
            "One": true,
            "Two": "One"
        };
        block = new ce.Block(errors, "", "Root");
        test.ok(!block.Base);
        test.ok(block.Root);
        e = new block.Two();
        test.ok(e instanceof block.Root);
        test.done();
    },

    testWithoutBase: function (test) {
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

    testDictParams: function (test) {
        var errors, block, e;
        errors = {
            "One": true,
            "Two": {
                parent: "One",
                defmessage: "def message"
            },
            "Three": {
                construct: function (a) {
                    this.a = a;
                    this.message = "a = " + a;
                }
            }
        };
        block = new ce.Block(errors, "ns");
        e = new block.Two();
        test.ok(e instanceof block.One);
        test.equals(e.message, "def message");
        test.equals(e.name, "ns.Two");
        e = new block.Three(2);
        test.ok(e instanceof block.Base);
        test.equals(e.a, 2);
        test.equals(e.message, "a = 2");
        test.equals(e.name, "ns.Three");
        test.done();
    },

    testLazyGetBase: function (test) {
        var errors, block, Base, e, One;
        errors = {
            One: true
        };
        block = new ce.Block(errors, "ns", null);
        Base = block.get("Base");
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
