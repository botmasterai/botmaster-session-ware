const MemoryStore = require('./adapters/MemoryStore');

const getSessionWare = options => {
    let store;
    switch (options.adapter) {
        case 'memory':
            store = new MemoryStore();
    }

    const incoming = (bot, update, next) => {
        store.get(update.sender.id).then( session => {
            update.context = session;
            next();
        }).catch(err => {
            next(err);
        });
    };

    const outgoing = (bot, update, next) => {
        store.set(update.recipient.id, update.context).then(() => {
            delete update.context;
            next();
        });
    };

    return {incoming, outgoing};
};

module.exports = {getSessionWare};
