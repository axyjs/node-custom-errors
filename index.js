/**
 * Creating custom exception classes
 *
 * @version 0.1.5
 * @author Oleg Grigoriev <go.vasac@gmail.com>
 * @license MIT https://github.com/axyjs/node-custom-errors/blob/master/LICENSE
 */

"use strict";

var Block, AbstractError, helpers;

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
 * @param {Function} [construct]
 *        the custom constructor for this class
 * @return {Function}
 *         the constructor of custom error
 */
function create(name, parent, defmessage, abstract, construct) {
    if (typeof name === "object") {
        return create(name.name, name.parent, name.defmessage, name.abstract, name.construct);
    }
    parent = parent || global.Error;
    if ((defmessage === null) || (defmessage === undefined)) {
        if (parent.ce && parent.ce.hasOwnProperty("defmessage")) {
            defmessage = parent.ce.defmessage;
        }
    }
    if (typeof construct !== "function") {
        if (parent.ce && (typeof parent.ce.construct === "function")) {
            construct = parent.ce.construct;
        } else {
            construct = null;
        }
    }
    function CustomError(message) {
        Error.call(this);
        Error.captureStackTrace(this, CustomError);
        if (abstract) {
            throw new AbstractError(name);
        }
        if (construct) {
            construct.apply(this, arguments);
        } else {
            if ((message !== undefined) && (message !== null)) {
                this.message = message;
            }
        }
    }
    CustomError.prototype = Object.create(parent.prototype);
    CustomError.prototype.constructor = CustomError;
    CustomError.prototype.name = name;
    CustomError.prototype.message = defmessage;
    CustomError.prototype.parent = helpers.parent;
    CustomError.ce = {
        parent: parent,
        defmessage: defmessage,
        construct: construct
    };
    CustomError.inherit = helpers.inherit;
    CustomError.toString = function () {
        return "[Error class " + name + "]";
    };
    return CustomError;
}

helpers = {
    /**
     * Execute the parent constructor
     *
     * @name CustomErrors#parent
     */
    parent: function parent() {
        var ce = this.constructor.ce;
        if (ce && ce.parent) {
            ce = ce.parent.ce;
            if (ce && (typeof ce.construct === "function")) {
                ce.construct.apply(this, arguments);
            }
        }
    },

    /**
     * Inherit from this class
     *
     * @name CustomErrors.inherit
     * @public
     * @param {(String|Object)} name
     * @param {String} [defmessage]
     * @param {Boolean} [abstract]
     * @param {Function} [construct]
     * @return {Function}
     */
    inherit: function inherit(name, defmessage, abstract, construct) {
        if (typeof name === "object") {
            name.parent = this;
            return create(name);
        }
        return create(name, this, defmessage, abstract, construct);
    }
};

/**
 * Can not instantiate abstract exceptions
 *
 * @class module.AbstractError
 * @augments Error
 */
AbstractError = create({
    name: "customErrors.AbstractError",
    /**
     * @constructs
     * @param {String} errorname
     */
    construct: function (errorname) {
        this.errorname = errorname;
        this.message = "Error " + errorname + " is abstract";
    }
});

/**
 * Class of errors block
 *
 * @class Block
 * @exports
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
    if ((base === undefined) || (base === true) || (base === null)) {
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
 * @name Block#get
 * @public
 * @param {String} name
 * @return {Function}
 * @throws {Block.ErrorNotFound}
 */
Block.prototype.get = function (name) {
    /* jshint maxcomplexity: 12 */
    var errors,
        ptr,
        params;
    if (typeof this[name] === "function") {
        return this[name];
    }
    errors = this.p.errors;
    params = {
        name: this.p.prefix + name
    };
    if (!errors.hasOwnProperty(name)) {
        if (this.p.base === name) {
            return this.getBase();
        }
        throw new Block.ErrorNotFound(params.name);
    }
    ptr = errors[name];
    if (typeof ptr === "object") {
        if (Array.isArray(ptr)) {
            params.defmessage = ptr[1];
            params.abstract = ptr[2];
            ptr = ptr[0];
        } else {
            ptr.name = params.name;
            params = ptr;
            if (params.hasOwnProperty("parent")) {
                ptr = params.parent;
            } else {
                ptr = true;
            }
        }
    }
    switch (typeof ptr) {
        case "function":
            this[name] = ptr;
            return ptr;
        case "boolean":
            params.parent = ptr ? this.getBase() : null;
            break;
        case "string":
            params.parent = this.get(ptr);
            break;
        default:
            throw new Block.ErrorNotFound("Error " + params.name + " is not found in the block");
    }
    this[name] = create(params);
    return this[name];
};

/**
 * Throw an error
 *
 * @name Block#raise
 * @public
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
 * @name Block#createAll
 * @public
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
 *
 * @name Block#getBase
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

/**
 * Flag, what all exceptions are created
 *
 * @name Block#created
 * @type {Boolean}
 */
Block.prototype.created = false;

/**
 * Requested exception is not found
 *
 * @class Block.ErrorNotFound
 * @augments Error
 */
Block.ErrorNotFound = create({
    name: "customErrors.ErrorNotFound",
    /**
     * @constructs
     * @param {String} errorname
     */
    construct: function (errorname) {
        this.errorname = errorname;
        this.message = "Error " + errorname + " is not found in block";
    }
});

module.exports.create = create;
module.exports.AbstractError = AbstractError;
module.exports.Block = Block;
