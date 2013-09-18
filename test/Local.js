var utils    = require('graftjs/test/utils');
var should   = require('should');
var path     = require('path');
var express  = require('express');
var Backbone = require('backbone');
var sinon    = require('sinon');
var testPort = 9503;


// Initialize the Graft application object.
var Graft    = require('graftjs/server');

function resetSpies() {
    Graft.Auth.request.reset();
    Graft.Auth.execute.reset();
    Graft.Auth.trigger.reset();
    Graft.Auth.SessionStore.destroy.reset();
    Graft.Auth.SessionStore.set.reset();
    Graft.Auth.SessionStore.get.reset();
}

function setupSpies() {
    sinon.spy(Graft.Auth, 'request');
    sinon.spy(Graft.Auth, 'execute');
    sinon.spy(Graft.Auth, 'trigger');
    sinon.spy(Graft.Auth.SessionStore, 'destroy');
    sinon.spy(Graft.Auth.SessionStore, 'get');
    sinon.spy(Graft.Auth.SessionStore, 'set');
}

function restoreSpies() {
    Graft.Auth.request.restore();
    Graft.Auth.execute.restore();
    Graft.Auth.trigger.restore();
    Graft.Auth.SessionStore.destroy.restore();
    Graft.Auth.SessionStore.set.restore();
    Graft.Auth.SessionStore.get.restore();
}

describe('Mounting Passport-Local Strategy', function() {

    before(function() {
        require('../server');
        require('../auth/local');
    });
    it('should have registered the subsystem', function() {
        Graft.Auth.should.have.property('Local');
    });
});


describe('Once Started', function() {
    before(setupSpies);

    before(function(done) {
        Graft.get('/', function(req, res) { res.send(req.session); });

        Graft.start({ port: testPort }).then(done);
    });

    it('should have fired the mount command', function() {
        sinon.assert.calledWith(Graft.Auth.execute, 'mount', 'local');
    });

    describe('Not Authenticated', function() {
        describe('/auth route', function() {
            before(utils.requestUrl(testPort, '/auth'));

            it('should return status 403', function() {
                this.resp.should.have.status(403);
            });
            it('should have set the session store', function() {
                sinon.assert.called(Graft.Auth.SessionStore.set);
            });

            it('response should have content-type json', function() {
                this.resp.should.have.header('content-type', 'application/json; charset=utf-8');
            });
            it('should have a body', function() {
                should.exist(this.body);
            });
            it('response should have the message Not Authorized', function() {
                this.body.error.should.eql('Not Authorized');
            });
            it('should have a cookie', function() {
                this.resp.should.have.header('Set-Cookie');
                this.resp.headers['set-cookie'][0].should.include('express.sid');
            });
        });

        describe('DELETE /auth route', function() {
            before(utils.requestUrl(testPort, '/auth', 'DELETE'));


            it('should return status 302', function() {
                this.resp.should.have.status(302);
            });

            it('should have fired the after:logout event', function() {
                //sinon.assert.calledWith(Graft.Auth.trigger, 'after:logout');
            });
        });

    });

    describe('Authenticated', function() {
        describe('/auth/local route', function() {
            before(utils.requestUrl(testPort, '/auth/local', 'post', {
                username: 'user',
                password: 'password'
            }));

            it('should have fired the verify:local event', function() {
                sinon.assert.calledWith(Graft.Auth.execute, 'verify:local');
            });

            it('should have serialized the user', function() {
                sinon.assert.calledWith(Graft.Auth.execute, 'serialize', { id: 'local' });
            });

            it('should return status 200', function() {
                this.resp.should.have.status(200);
            });

            it('should have redirected us', function() {
                this.resp.req.path.should.eql('/');
            });
        });
    });



    after(restoreSpies);
    after(function() {
        Graft.Auth.SessionStore.sessions = {};
    });
    describe('stop server', utils.stopServer);

});
