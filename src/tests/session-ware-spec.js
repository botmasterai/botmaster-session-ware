require('should');
const R = require('ramda');
const SessionWare = require('../');

describe('SessionWare', () => {
    it('should export incoming and outgoing ware', () => {
        const sessionWare = SessionWare();
        sessionWare.should.have.property('incoming');
        sessionWare.incoming.should.be.type('function');
        sessionWare.should.have.property('outgoing');
        sessionWare.outgoing.should.be.type('function');
    });

    it('should populate update with defined sessionPath', done => {
        const sessionWare = SessionWare({sessionPath: 'session.context'});
        const update = { sender: {id: 1}};
        const bot = {type: 'not a real bot'};
        sessionWare.incoming(bot, update, (err => {
            if (err) throw err;
            update.session.should.have.property('context');
            done();
        }));
    });


    it('should be able to get a stored variable on the second pass', done => {
        const sessionWare = SessionWare();
        const update = { sender: {id: 1}};
        const newUpdate = R.clone(update);
        const bot = {type: 'not a real bot'};
        const message = { recipient: {id: 2}};
        sessionWare.incoming(bot, update, err => {
            if (err) throw err;
            update.session.a = 123;
            sessionWare.outgoing(bot, update, message, err => {
                if (err) throw err;
                sessionWare.incoming(bot, newUpdate, err => {
                    if (err) throw err;
                    newUpdate.session.a.should.be.equal(123);
                    done();
                });
            });
        });
    });

    it('should throw an error if the specified adapter does not have get or set methods', done => {
        const adapter = {
            get: 'hi',
            set: {}
        };
        try {
            const sessionWare = sessionWare({adapter});
            done('Did not throw an error on incorrect adapter type');
        } catch (err) {
            done();
        }
    });
});
