"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * The most basic adapter ever for SessionWare
 * @class
 */
var MemoryStore = function () {
    function MemoryStore() {
        _classCallCheck(this, MemoryStore);

        this.store = {};
    }

    /**
     *  Get or create a session with the id.
     * @param {String} id a unique id for the session
     * @returns {Promise} evaluates to an object that is the  session
     */


    _createClass(MemoryStore, [{
        key: "get",
        value: function get(id) {
            return Promise.resolve(this.store[id] || {});
        }

        /**
         *  Update a session in the storage.
         *  @param {String} id a unique id for the session
         *  @param {Object} value the new value for the session
         *  @return {Promise} resolves when the session has been saved
         */

    }, {
        key: "set",
        value: function set(id, value) {
            this.store[id] = value;
            return Promise.resolve();
        }
    }]);

    return MemoryStore;
}();

module.exports = MemoryStore;