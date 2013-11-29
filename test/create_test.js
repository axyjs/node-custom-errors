/**
 * Test: function create()
 */
"use strict";

var ce = require("../");

module.exports = {

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

    testDefmessage: function (test) {
        var CustomE = ce.create("CustomE", Error, "default message"),
            e1 = new CustomE(),
            e2 = new CustomE("message");
        test.equals(e1.message, "default message");
        test.equals(e2.message, "message");
        test.done();
    },
    
    testInheritDefmessage: function (test) {
        var One = ce.create("One", null, "one def"),
            Two = One.inherit("Two"),
            Three = Two.inherit("Three", "three def");
        test.equals((new One()).message, "one def");
        test.equals((new Two()).message, "one def");
        test.equals((new Two("msg")).message, "msg");
        test.equals((new Three()).message, "three def");
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
    },
    
    testInheritCustomConstruct: function (test) {
        var One = ce.create({
                name: "One",
                construct: function (a, b) {
                    this.a = a;
                    this.b = b;
                    this.message = a + " + " + b + " = " + (a + b);
                }
            }),
            Two = One.inherit("Two"),
            Three = Two.inherit({
                name: "Three",
                construct: function (a, b, c) {
                    this.parent(a, b);
                    this.c = c;
                }
            }),
            e2 = new Two(1, 2),
            e3 = new Three(3, 4, 5);
        test.equals(e2.message, "1 + 2 = 3");
        test.equals(e3.a, 3);
        test.equals(e3.b, 4);
        test.equals(e3.c, 5);
        test.done();
    }
};

