/**
 * Creating custom exception classes
 *
 * @version 0.0.1
 * @author Oleg Grigoriev <go.vasac@gmail.com>
 * @license MIT https://github.com/axyjs/node-custom-errors/blob/master/LICENSE
 */

"use strict";

var Block, AbstractError;

/**
 * Create a custom error class
 *
 * @param {(String|Object)} name
 *        the name of exception (or dictionary of arguments)
 * @param {Function} [parent]
 *        the parent exception class (constructor) (Error by default)
 * @param {String} [defmessage]
 *        the default message
 * @param {Boolean} [abstract]
 *        the flag of an abstract class
 * @return {Function}
 *         the constructor of custom error
 */
function create(name, parent, defmessage, abstract) {
    if (typeof name === "object") {
        return create(name.name, name.parent, name.defmessage, name.abstract);
    }
    parent = parent || global.Error;
    defmessage = defmessage || "";
    function CustomError(message) {
        var stack;
        if (abstract) {
            throw new AbstractError("Error " + name +" is abstract");
        }
        this.message = (message === undefined) ? defmessage : message;
        stack = (new Error()).stack.split("\n");
        this.stack = name + (this.message ? (": " + this.message) : "");
        this.stack += "\n" + stack.slice(2).join("\n");
    }
    CustomError.prototype = Object.create(parent.prototype);
    CustomError.prototype.constructor = CustomError;
    CustomError.prototype.name = name;
    CustomError.name = name;
    CustomError.inherit = function inherit(name, defmessage, abstract) {
        return create(name, CustomError, defmessage, abstract);
    };
    CustomError.toString = function () {
        return "[Error class " + name + "]";
    };
    return CustomError;
}

AbstractError = create("customErrors.AbstractError", Error, "This error class is abstract");

/**
 * Block of errors
 *
 * @constructor
 * @param {Object} errors
 *        a dictionary "error name" => "parameters" (mixed)
 * @param {String} [namespace]
 *        a basic namespace for the block
 * @param {*} [base]
 *        a basic error class for the block
 * @param {Boolean} [lazy]
 *        use lazy load
 */
function Block(errors, namespace, base, lazy) {
    if ((base === undefined) || (base === true)) {
        base = "Base";
    } else if (base === false) {
        base = Error;
    } else if (typeof base !== "function") {
        base = "" + base;
    }
    this.p = {
        errors: errors,
        namespace: namespace,
        prefix: namespace ? (namespace + ".") : "",
        base: base,
        lazy: !!lazy
    };
    this.created = false;
    if (!this.p.lazy) {
        this.createAll();
    }
}

/**
 * Get an error object from the block
 *
 * @param {String} name
 * @return {Function}
 * @throws {Block.ErrorNotFound}
 */
Block.prototype.get = function (name) {
    var errors, params, Err, fullname, parent, defmessage, abstract;
    if (typeof this[name] === "function") {
        return this[name];
    }
    errors = this.p.errors;
    fullname = this.p.prefix + name;
    if (!errors.hasOwnProperty(name)) {
        throw new Block.ErrorNotFound("Error " + fullname + " is not found in the block");
    }
    params = errors[name];
    if (Array.isArray(params)) {
        defmessage = params[1];
        abstract = params[2];
        params = params[0];
    }
    if (typeof params === "function") {
        this[name] = params;
        return params;
    }
    if (params === true) {
        parent = this.getBase();
    } else if (params === false) {
        parent = null;
    } else if (typeof params === "string") {
        parent = this.get(params);
    } else {
        throw new Block.ErrorNotFound("Error " + fullname + " is not found in the block");
    }
    Err = create(fullname, parent, defmessage, abstract);
    this[name] = Err;
    return Err;
};

/**
 * Throw an error
 *
 * @param {String} name
 * @param {String} [message]
 * @throws {Block.ErrorNotFound}
 */
Block.prototype.raise = function (name, message) {
    var Error = this.get(name);
    throw new Error(message);
};

/**
 * Create all errors
 *
 * @return {void}
 */
Block.prototype.createAll = function () {
    var errors = this.p.errors,
        name;
    if (this.created) {
        return;
    }
    for (name in errors) {
        if (errors.hasOwnProperty(name)) {
            this.get(name);
        }
    }
    this.created = true;
};

/**
 * Get the base error class of the block
 * @private
 * @return {Function}
 */
Block.prototype.getBase = function () {
    var base = this.p.base,
        name;
    if (typeof base === "string") {
        name = base;
        base = create(this.p.prefix + name, Error, "", true);
        this[name] = base;
        this.p.base = base;
    }
    return base;
};

Block.ErrorNotFound = create("customErrors.ErrorNotFound", Error, "Error is not found in the block");

module.exports.create = create;
module.exports.AbstractError = AbstractError;
module.exports.Block = Block;
