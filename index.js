const R = require('ramda');
const Debug = require('debug');

/**
 * Create an object providing incoming and outgoing middleware
 * @param {Object} [options] 
 * @param  {Object} [adapter] an object implementing the adapter api. defaults to in memory.
 * @param  {String} [sessionPath] dot denoted path to where to store the context in the update. defaults to 'session'
 * @return {Object} an object that contains two functions 'incoming' and 'outgoing'. The incoming should be placed before any middleware that requires it and the outgoing should be placed after all middleware have used it.
 */
const SessionWare = ({adapter, sessionPath='session'}) => {
    sessionPath = sessionPath.split('.');
    let store;
    if (adapter) {
        store = adapter;
    }
    else {
        const MemoryStore = require('./adapters/MemoryStore');
        store = new MemoryStore();
    }

    const incoming = (bot, update, next) => {
        store.get(update.sender.id).then( session => {
            const sessionPathLens = R.lensPath(sessionPath.splice(1));
            update[sessionPath[0]] = R.set(sessionPathLens, session, update);
            next();
        }).catch(err => {
            Debug('botmaster:session:incoming')(`error ${err.message}`);
            next(err);
        });
    };

    const outgoing = (bot, update, next) => {
        const sessionPathLens = R.lensPath(sessionPath);
        const session = R.view(sessionPathLens, update);
        store.set(update.recipient.id, session).then(() => {
            Debug('botmaster:session:outgoing')('updated session');
            delete update.context;
            next();
        });
    };

    return {incoming, outgoing};
};

module.exports = SessionWare;
