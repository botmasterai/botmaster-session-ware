'use strict';

var R = require('ramda');
var Debug = require('debug');
var assert = require('assert');

var recipient = R.path(['recipient', 'id']);
var sender = R.path(['sender', 'id']);
var idFromUpdate = function idFromUpdate(update) {
    return 'recipient:' + recipient(update) + '-sender:' + sender(update);
};
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
var SessionWare = function SessionWare(options) {
    var _ref = options || {},
        _ref$sessionPath = _ref.sessionPath,
        sessionPath = _ref$sessionPath === undefined ? 'session' : _ref$sessionPath,
        adapter = _ref.adapter;

    sessionPath = sessionPath.split('.');
    var store = void 0;
    if (adapter) {
        store = adapter;
        if (typeof store.get !== 'function' || typeof store.set !== 'function') throw new Error('Adapter does not have required methods get and/or set');
    } else {
        var MemoryStore = require('./adapters/MemoryStore');
        store = new MemoryStore();
    }

    var incoming = {
        type: 'incoming',
        name: 'session-ware-wrapped-incoming',
        controller: function controller(bot, update, next) {
            store.get(idFromUpdate(update)).then(function (session) {
                Debug('botmaster:session:incoming')('got session for ' + idFromUpdate(update));
                var sessionPathLens = R.lensPath(sessionPath.splice(1));
                update[sessionPath[0]] = R.set(sessionPathLens, session, update);
                next();
            }).catch(function (err) {
                Debug('botmaster:session:incoming')('error ' + err.message);
                next(err);
            });
        }
    };

    var outgoing = {
        type: 'outgoing',
        name: 'session-ware-wrapped-outgoing',
        controller: function controller(bot, update, message, next) {
            assert(typeof next == 'function', 'please ensure you have the correct version of botmaster');
            var sessionPathLens = R.lensPath(sessionPath);
            var session = R.view(sessionPathLens, update);
            // if we cannot find the session do not try to set it. This might happen if other middleware sends
            // another message without sending on the session
            if (!session) {
                return next();
            }
            store.set(idFromUpdate(update), session).then(function () {
                Debug('botmaster:session:outgoing')('updated session for ' + idFromUpdate(update));
                next();
            });
        }
    };

    return { incoming: incoming, outgoing: outgoing };
};

module.exports = SessionWare;