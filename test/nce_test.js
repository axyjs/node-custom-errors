"use strict";

var ce = require("../");

module.exports.create = {
    testCreate: function (test) {
        var CustomE = ce.create("CustomE");
        try {
            throw new CustomE("message");
        } catch (e) {
            test.ok(e instanceof CustomE);
            test.ok(e instanceof Error);
            test.equals(e.message, "message");
            test.equals(e.name, "CustomE");
        }
        test.done();
    },

    testInherit: function (test) {
        var One = ce.create("One", TypeError),
            Two = ce.create("Two", One),
            Three = Two.inherit("Three"),
            Four = Two.inherit({
                name: "Four",
                construct: function (x) {
                    this.message = "x = " + x;
                }
            }),
            e3 = new Three(),
            e4 = new Four(4);
        test.ok(e3 instanceof Error);
        test.ok(e3 instanceof TypeError);
        test.ok(e3 instanceof One);
        test.ok(e3 instanceof Two);
        test.ok(e3 instanceof Three);
        test.ok(e4 instanceof Two);
        test.equals(e4.name, "Four");
        test.equals(e4.message, "x = 4");
        test.done();
    },

    testMessage: function (test) {
        var CustomE = ce.create("CustomE", Error, "default message"),
            e1 = new CustomE(),
            e2 = new CustomE("message");
        test.equals(e1.message, "default message");
        test.equals(e2.message, "message");
        test.done();
    },

    testStack: function (test) {
        var CustomE = ce.create("CustomE"),
            stack = (new Error()).stack.split("\n"),
            e = new CustomE("msg"),
            estack = e.stack.split("\n");
        test.equals(estack[0], "CustomE: msg");
        test.equals(estack[1].split("(")[0], stack[1].split("(")[0]);
        test.equals(estack.slice(2, 5).join("\n"), stack.slice(2, 5).join("\n"));
        test.done();
    },

    testAbstract: function (test) {
        var Base = ce.create("Base", Error, null, true),
            Concrete = Base.inherit(Base, "def"),
            e = new Concrete();
        test.equals(e.message, "def");
        test.ok(e instanceof Base);
        test.throws(function () {
            e = new Base();
        }, ce.AbstractError);
        test.done();
    },

    testArgumentsAsParams: function (test) {
        var CustomE, e;
        CustomE = ce.create({
            name: "MyError",
            parent: TypeError,
            defmessage: "default message"
        });
        e = new CustomE();
        test.ok(e instanceof TypeError);
        test.equals(e.name, "MyError");
        test.equals(e.message, "default message");
        test.done();
    },

    testCustomConstruct: function (test) {
        var PropNotFound, e;
        PropNotFound = ce.create({
            name: "PropNotFound",
            construct: function (container, property) {
                this.container = container;
                this.property = property;
                this.message = "'" + property + "' is not found in '" + container + "'";
            }
        });
        e = new PropNotFound("MyService", "undef");
        test.equals(e.name, "PropNotFound");
        test.equals(e.container, "MyService");
        test.equals(e.property, "undef");
        test.equals(e.message, "'undef' is not found in 'MyService'");
        test.done();
    }
};

module.exports.block = {
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
