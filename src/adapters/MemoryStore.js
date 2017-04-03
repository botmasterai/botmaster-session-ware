/**
 * The most basic adapter ever for SessionWare. This is the default store that is
 * used when instantiating a SessionWare object without any params.
 * It provides the standard required API for stores. I.e. a getter and a setter method.
 * Called `get` and `set` that both return promises where get resolves with the session
 * value and set sets the session value
 * @class
 */
class MemoryStore {
    constructor() {
        this.store = {};
    }

    /**
     *  Get or create a session with the id.
     * @param {String} id a unique id for the session
     * @returns {Promise} evaluates to an object that is the  session
     */
    get(id) {
        return Promise.resolve(this.store[id] || {});
    }

    /**
     *  Update a session in the storage.
     *  @param {String} id a unique id for the session
     *  @param {Object} value the new value for the session
     *  @return {Promise} resolves when the session has been saved
     */
    set(id, value) {
        this.store[id] = value;
        return Promise.resolve();
    }
}

module.exports = MemoryStore;
