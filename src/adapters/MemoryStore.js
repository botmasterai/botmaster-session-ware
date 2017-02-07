/**
 * The most basic adapter ever for SessionWare
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
