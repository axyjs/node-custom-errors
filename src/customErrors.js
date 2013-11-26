/**
 * Creating custom exception classes
 *
 * @version 0.0.1
 * @author Oleg Grigoriev <go.vasac@gmail.com>
 * @license MIT https://github.com/axyjs/node-custom-errors/blob/master/LICENSE
 */

"use strict";

var AbstractError;

/**
 * Create a custom error class
 *
 * @param {String} name
 *        the name of exception
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
    return CustomError;
}

AbstractError = create("AbstractError", Error, "This error class is abstract");

module.exports.create = create;
module.exports.AbstractError = AbstractError;