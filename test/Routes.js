var utils    = require('graftjs/test/utils');
var should   = require('should');
var path     = require('path');
var express  = require('express');
var Backbone = require('backbone');
var sinon    = require('sinon');
var testPort = 9502;


// Initialize the Graft application object.
var Graft    = require('graftjs/server');

var TestModel = Backbone.Model.extend({});

describe('Before Start', function() {
  before(function() {
    Graft.BaseModel = TestModel;
    require('../server');
  });

  it('should have loaded the Auth system', function() {
    Graft.systems.should.have.property('Auth');
    should.exist(Graft.Auth);
  });

  it('should have commands and reqres', function() {
    should.exist(Graft.Auth.commands);
    should.exist(Graft.Auth.reqres);
  });

  it('should have Auth.Model', function() {
    should.exist(Graft.Auth.Model);
  });

  it('Auth.Model should default to Graft.BaseModel', function() {
    (new Graft.Auth.Model()).should.be.instanceOf(TestModel);
  });
  it('should have Auth.SessionStore', function() {
    should.exist(Graft.Auth.SessionStore);
  });
});

describe('Mounting Dummy Strategy', function() {

  before(function() {
    require('../auth/dummy');
  });
  it('should have registered the subsystem', function() {
    Graft.Auth.should.have.property('Dummy');
  });
});

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

describe('Once Started', function() {
  before(setupSpies);

  before(function(done) {
    Graft.get('/', function(req, res) { res.send(req.session); });

    Graft.start({ port: testPort }).then(done);
  });

  it('should have fired the mount command', function() {
    sinon.assert.calledWith(Graft.Auth.execute, 'mount', 'dummy');
  });

  it('should have fired the mount:routes event', function() {
    sinon.assert.calledWith(Graft.Auth.trigger, 'mount:routes');
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

    describe('/auth logout route (DELETE)', function() {
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
    describe('/auth/dummy route', function() {
      before(utils.requestUrl(testPort, '/auth/dummy'));
      it('should have fired the verify:dummy event', function() {
        sinon.assert.calledWith(Graft.Auth.execute, 'verify:dummy');
      });
      it('should have serialized the user', function() {
        sinon.assert.calledWith(Graft.Auth.execute, 'serialize', { id: 'dummy' });
      });

      it('should return status 200', function() {
        this.resp.should.have.status(200);
      });

      it('should have redirected us', function() {
        this.resp.req.path.should.eql('/');
      });
    });

    describe('/auth route', function() {
      before(resetSpies);

      before(utils.requestUrl(testPort, '/auth'));
      it('should have deserialized the user', function() {
        sinon.assert.calledWith(Graft.Auth.execute, 'deserialize');
      });
      it('should return status 200', function() {
        this.resp.should.have.status(200);
      });

      it('should have returned json', function() {
        this.resp.should.be.json;
      });

      it('should have returned the user object', function() {
        this.body.should.have.property('id', 'dummy');
      });
    });

    describe('logged out', function() {
      before(resetSpies);


      describe('/auth logout route (DELETE)', function() {
        before(utils.requestUrl(testPort, '/auth', 'DELETE'));

        it('should have set the session store', function() {
          sinon.assert.called(Graft.Auth.SessionStore.set);
        });
        it('should have deserialized the user', function() {
          sinon.assert.calledWith(Graft.Auth.execute, 'deserialize');
        });
        it('should return status 302', function() {
          this.resp.should.have.status(302);
        });
      });

      describe('/auth route', function() {
        before(utils.requestUrl(testPort, '/auth'));

        it('should return status 403', function() {
          this.resp.should.have.status(403);
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
      });

    });
  });
});


describe('Once Started', function() {
  after(restoreSpies);
  describe('stop server', utils.stopServer);
});
