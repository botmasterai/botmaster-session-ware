'use strict';

require('should');
var R = require('ramda');
var SessionWare = require('../');

describe('SessionWare', function () {
    it('should export incoming and outgoing ware', function () {
        var sessionWare = SessionWare();
        sessionWare.should.have.property('incoming');
        sessionWare.incoming.should.be.type('object');
        sessionWare.incoming.controller.should.be.type('function');
        sessionWare.should.have.property('outgoing');
        sessionWare.outgoing.should.be.type('object');
        sessionWare.outgoing.controller.should.be.type('function');
    });

    it('should populate update with defined sessionPath', function (done) {
        var sessionWare = SessionWare({ sessionPath: 'session.context' });
        var update = { sender: { id: 1 } };
        var bot = { type: 'not a real bot' };
        sessionWare.incoming.controller(bot, update, function (err) {
            if (err) throw err;
            update.session.should.have.property('context');
            done();
        });
    });

    it('should be able to get a stored variable on the second pass', function (done) {
        var sessionWare = SessionWare();
        var update = { sender: { id: 1 } };
        var newUpdate = R.clone(update);
        var bot = { type: 'not a real bot' };
        var message = { recipient: { id: 2 } };
        sessionWare.incoming.controller(bot, update, function (err) {
            if (err) throw err;
            update.session.a = 123;
            sessionWare.outgoing.controller(bot, update, message, function (err) {
                if (err) throw err;
                sessionWare.incoming.controller(bot, newUpdate, function (err) {
                    if (err) throw err;
                    newUpdate.session.a.should.be.equal(123);
                    done();
                });
            });
        });
    });

    it('should throw an error if the specified adapter does not have get or set methods', function (done) {
        var adapter = {
            get: 'hi',
            set: {}
        };
        try {
            var sessionWare = sessionWare({ adapter: adapter });
            done('Did not throw an error on incorrect adapter type');
        } catch (err) {
            done();
        }
    });
});