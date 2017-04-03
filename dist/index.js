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
 * Create an object providing incoming and outgoing middleware
 * @param {Object} [options] options object for generated sessionWare
 * @param {Object} [options.adapter] an object implementing the adapter api. defaults to in memory.
 * @param {String} [options.sessionPath] dot denoted path to where to store the context in the update. defaults to 'session'
 * @return {Object} an object that contains two functions 'incoming' and 'outgoing'. The incoming should be placed before any middleware that requires it and the outgoing should be placed after all middleware have used it.
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
        controller: function controller(bot, update, message, next) {
            assert(typeof next == 'function', 'please ensure you have the correct version of botmaster');
            var sessionPathLens = R.lensPath(sessionPath);
            var session = R.view(sessionPathLens, update);
            store.set(idFromUpdate(update), session).then(function () {
                Debug('botmaster:session:outgoing')('updated session for ' + idFromUpdate(update));
                next();
            });
        }
    };

    return { incoming: incoming, outgoing: outgoing };
};

module.exports = SessionWare;