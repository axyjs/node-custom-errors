/**
 * Test: function create()
 */
"use strict";

var ce = require("../index.js");

module.exports = {

    testErrorCreate: function (test) {
        var CE = ce.create("CE");
        test.equals(typeof CE, "function");
        try {
            throw new CE("message");
        } catch (e) {
            test.ok(e instanceof CE);
            test.ok(e instanceof Error);
            test.equals(e.name, "CE");
        }
        test.done();
    },

    testMessage: function (test) {
        var CE = ce.create("CE"),
            e = new CE("Error message");
        test.equals(e.message, "Error message");
        test.done();
    },

    testParent: function (test) {
        var Parent = ce.create("Parent", TypeError),
            Child = ce.create("Child", Parent),
            e = new Child();
        test.ok(e instanceof Error);
        test.ok(e instanceof TypeError);
        test.ok(e instanceof Parent);
        test.ok(e instanceof Child);
        test.equals(e.name, "Child");
        test.done();
    },

    testInherit: function (test) {
        var Parent = ce.create("Parent", TypeError),
            Child = Parent.inherit("Child"),
            e;
        test.equals(typeof Child, "function");
        e = new Child();
        test.ok(e instanceof Error);
        test.ok(e instanceof TypeError);
        test.ok(e instanceof Parent);
        test.ok(e instanceof Child);
        test.equals(e.name, "Child");
        test.done();
    },

    testDefmessage: function (test) {
        var CE = ce.create("CE", null, "default message"),
            e1 = new CE(),
            e2 = new CE("message");
        test.equals(e1.message, "default message");
        test.equals(e2.message, "message");
        test.done();
    },

    testDefmessageInherit: function (test) {
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
        var CE = ce.create("CE"),
            stack = (new Error()).stack.split("\n"),
            e = new CE("msg"),
            estack = e.stack.split("\n");
        test.equals(estack[0], "CE: msg");
        test.equals(estack[1].split("(")[0], stack[1].split("(")[0]); // the current filename
        test.equals(estack.slice(2).join("\n"), stack.slice(2).join("\n")); // the rest of the stack
        test.done();
    },

    testAbstract: function (test) {
        var Base = ce.create("Base", Error, null, true),
            Concrete = Base.inherit(Base, "def"),
            e = new Concrete();
        test.equals(e.message, "def");
        test.ok(e instanceof Base);
        test.throws(function () {
            return new Base();
        }, ce.AbstractError);
        test.done();
    },

    testCreateSingleArgument: function (test) {
        var CE = ce.create({
                name: "MyError",
                parent: TypeError,
                defmessage: "default message"
            }),
            e = new CE();
        test.ok(e instanceof TypeError);
        test.equals(e.name, "MyError");
        test.equals(e.message, "default message");
        test.done();
    },

    testInheritSingleArgument: function (test) {
        var Parent = ce.create("Parent"),
            Child = Parent.inherit({
                name: "Child",
                parent: Parent,
                defmessage: "def message"
            }),
            e = new Child();
        test.ok(e instanceof Parent);
        test.equals(e.name, "Child");
        test.equals(e.message, "def message");
        test.done();
    },

    testCustomConstruct: function (test) {
        var PropNotFound = ce.create({
                name: "PropNotFound",
                construct: function (container, property) {
                    this.container = container;
                    this.property = property;
                    this.message = "'" + property + "' is not found in '" + container + "'";
                }
            }),
            e = new PropNotFound("MyService", "undef");
        test.equals(e.name, "PropNotFound");
        test.equals(e.container, "MyService");
        test.equals(e.property, "undef");
        test.equals(e.message, "'undef' is not found in 'MyService'");
        test.done();
    },

    testCustomConstructInherit: function (test) {
        var Parent = ce.create({
                name: "Parent",
                construct: function (a, b) {
                    this.a = a;
                    this.b = b;
                    this.message = a + " + " + b + " = " + (a + b);
                }
            }),
            Child = Parent.inherit("Child"),
            e = new Child(1, 2);
        test.equals(e.a, 1);
        test.equals(e.message, "1 + 2 = 3");
        test.done();
    },

    testExecParentConstruct: function (test) {
        var Parent = ce.create({
                name: "Parent",
                construct: function (a, b) {
                    this.a = a;
                    this.b = b;
                    this.message = a + " + " + b + " = " + (a + b);
                }
            }),
            Child = Parent.inherit({
                name: "Child",
                construct: function (a, b, c) {
                    this.parent(a, b);
                    this.c = c;
                    this.message = this.a + ":" + this.b + ":" + this.c;
                }
            }),
            e = new Child(1, 2, 3);
        test.equals(e.message, "1:2:3");
        test.done();
    },

    testParentHasNoCustomConstruct: function (test) {
        var One = ce.create({
                name: "One",
                construct: function (a) {
                    this.parent();
                    this.a = a;
                }
            }),
            Two = ce.create("Two"),
            Three = Two.inherit({
                name: "Three",
                construct: function (b) {
                    this.parent();
                    this.b = b;
                }
            });
        test.equals((new One(1)).a, 1);
        test.equals((new Three(2)).b, 2);
        test.done();
    },

    testLevel: function (test) {
        var BaseError,
            SapError,
            SapOperationError,
            sapInstance,
            opInstance;

        BaseError = ce.create({
            name: 'BaseError',
            abstract: true,
            construct: function (err) {
                this.inner = err;
            }
        });

        SapError = ce.create({
            name: 'SapError',
            parent: BaseError,
            construct: function construct(err, context) {
                BaseError.init(this, err);
                this.context = context || undefined;
            }
        });

        SapOperationError = ce.create({
            name: 'SapOperationError',
            parent: SapError,
            construct: function construct(err, context, errors) {
                SapError.init(this, err, context);
                this.errors = errors || undefined;
            }
        });

        sapInstance = new SapError('err', 'context');
        opInstance = new SapOperationError('err2', 'context2', ["message"]);

        test.equals(sapInstance.inner, "err");
        test.equals(sapInstance.context, "context");

        test.equals(opInstance.inner, "err2");
        test.equals(opInstance.context, "context2");
        test.equals(opInstance.errors[0], "message");

        test.done();
    }
};

