const R = require('ramda');
const Debug = require('debug');
const assert = require('assert');

const recipient = R.path(['recipient', 'id']);
const sender = R.path(['sender', 'id']);
const idFromUpdate = update => `recipient:${recipient(update)}-sender:${sender(update)}`;
/**
 * Create an object providing incoming and outgoing middleware that manages a 
 * session object for you. By using this middleware, your other middleware will
 * have access to a persisted `update.session` object.
 *
 * @param {Object} [options] options object for generated sessionWare
 * @param {Object} [options.adapter] an object implementing the adapter api. defaults to in MemoryStore.
 * @param {String} [options.sessionPath] dot denoted path to where to store the context in the update. defaults to 'session'
 * @return {Object} an object that contains two functions 'incoming' and 'outgoing'.
 * They should be used with the useWrapped method of botmaster
 */
const SessionWare = (options) => {
    let {sessionPath = 'session', adapter} = options || {};
    sessionPath = sessionPath.split('.');
    let store;
    if (adapter) {
        store = adapter;
        if (typeof store.get !== 'function' || typeof store.set !== 'function')
            throw new Error('Adapter does not have required methods get and/or set');
    }
    else {
        const MemoryStore = require('./adapters/MemoryStore');
        store = new MemoryStore();
    }

    const incoming = {
        type: 'incoming',
        name: 'session-ware-wrapped-incoming',
        controller: (bot, update, next) => {
            store.get(idFromUpdate(update)).then( session => {
                Debug('botmaster:session:incoming')(`got session for ${idFromUpdate(update)}`);
                const sessionPathLens = R.lensPath(sessionPath.splice(1));
                update[sessionPath[0]] = R.set(sessionPathLens, session, update);
                next();
            }).catch(err => {
                Debug('botmaster:session:incoming')(`error ${err.message}`);
                next(err);
            });
        }
    }

    const outgoing = {
        type: 'outgoing',
        name: 'session-ware-wrapped-outgoing',
        controller: (bot, update, message, next) => {
            assert(typeof next == 'function', 'please ensure you have the correct version of botmaster');
            const sessionPathLens = R.lensPath(sessionPath);
            const session = R.view(sessionPathLens, update);
            // if we cannot find the session do not try to set it. This might happen if other middleware sends
            // another message without sending on the session
            if (!session) {
                return next();
            }
            store.set(idFromUpdate(update), session).then(() => {
                Debug('botmaster:session:outgoing')(`updated session for ${idFromUpdate(update)}`);
                next();
            });
        }
    }

    return {incoming, outgoing};
};

module.exports = SessionWare;
