var utils    = require('graftjs/test/utils');
var should   = require('should');
var path     = require('path');
var express  = require('express');
var Backbone = require('backbone');
var sinon    = require('sinon');
var crypto   = require('crypto');
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

        Graft.Auth.secret = {
          "salt": "41c968e8b04a279c5bd359692cf06011"
        };
        Graft.Auth.Model = Backbone.Model.extend({
          urlRoot: '/api/Account',
          defaults: {
            username: 'admin',
            password: 'b05ac7d2c3d27d3a421b775827ee314d339bfa952d205373f22c2d82510f53f9' // test
          },
          hash: function(string) {
            return crypto.createHmac('sha256', Graft.Auth.secret.salt).update(string).digest('hex');
          },
          getLoginHash: function(timestamp, string) {
            var ts = new Date(timestamp || Date.now());
            ts.setSeconds(0);
            ts.setMinutes(0);
            ts.setUTCMilliseconds(0);

            var string = ['' + ts.getTime(), string].join('-');

            return this.hash(string).slice(0, 8);
          }
        });

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
                sinon.assert.calledWith(Graft.Auth.trigger, 'after:logout');
            });
        });

    });

    describe('Authenticated', function() {
        describe('/auth/local route', function() {
            before(utils.requestUrl(testPort, '/auth/local', 'POST', {
                username: 'admin',
                password: 'test'
            }));

            it('should have fired the verify:local event', function() {
              sinon.assert.calledWith(Graft.Auth.execute, 'verify:local');
            });

            it('should return status 302 (login success)', function() {
              this.resp.should.have.status(302);
            });

        });
    });



    after(restoreSpies);
    after(function() {
        Graft.Auth.SessionStore.sessions = {};
    });
    describe('stop server', utils.stopServer);

});
