class MemoryStore {
    constructor() {
        this.store = {};
    }

    get(id) {
        return Promise.resolve(this.store[id]);
    }

    set(id, value) {
        return Promise.resolve(this.store[id] = value);
    }
}

module.exports = MemoryStore;
