/**
 * Primary passport service implementation 
*/
var express     = require('express');
var http        = require('http');
var passport    = require('passport');
var MemoryStore = require('connect/lib/middleware/session/memory');

this.vent       = new Backbone.Wreqr.EventAggregator();
this.commands   = new Backbone.Wreqr.Commands();
this.reqres     = new Backbone.Wreqr.RequestResponse();
var _express    = express();
this.express    = _express;
this.server     = http.createServer(this.express);


_.extend(this, _express, {
    // Command execution, facilitated by Backbone.Wreqr.Commands
    execute: function(){
        var args = Array.prototype.slice.apply(arguments);
        this.commands.execute.apply(this.commands, args);
    },
    // Request/response, facilitated by Backbone.Wreqr.RequestResponse
    request: function(){
        var args = Array.prototype.slice.apply(arguments);
        return this.reqres.request.apply(this.reqres, args);
    }
});

// Set to specify which model is to be used for authentication.
this.Model = this.Model || Graft.BaseModel;

// Set a SessionStore to use for storing sessions.
this.SessionStore = this.SessionStore || new MemoryStore({
    reapInterval: 60000 * 10
});

this.commands.setHandler('deserialize', function(obj, done) {
    done(null, new this.Model(obj));
}, this);

this.commands.setHandler('serialize', function(user, done) {
    done(null, user);
});

this.commands.setHandler('verify', function(user, done) {
    done(null, false, { error: 'No Authentication Strategy' });
});

this.addInitializer(function(options) {
    passport.serializeUser(this.execute.bind(this, 'serialize'));
    passport.deserializeUser(this.execute.bind(this, 'deserialize'));
});

this.reqres.setHandler('failureRedirect', _.f.functionize('/'));
this.reqres.setHandler('successRedirect', _.f.functionize('/'));
this.reqres.aliasHandler('logoutRedirect', 'successRedirect');

this.commands.setHandler('mount', function(key, strategy, method) {
    var method = method || 'get';

    var opts = {
        successRedirect: this.request('successRedirect'),
        failureRedirect: this.request('failureRedirect')
    };

    debug('mount', method, key);
    function testFn(req, res, next) { debug('called mount', method, key); next(); }
    this[method]('/' + key, testFn, passport.authenticate(key, opts));
}, this);

this.reqres.setHandler('createStrategy', function(key, Strategy, opts) {
    var opts = opts || {};

    var verifyFn = function() {
        var args = Array.prototype.slice.apply(arguments);
        args.unshift('verify:'+key);
        this.execute.apply(this, args);
    }.bind(this);


    var strategy = new Strategy(opts, verifyFn);
    strategy.name = key;

    passport.use(key, strategy);
}, this);

Graft.Server.on('after:mount:server', function server(opts) {
    this.use(express.cookieParser());
    this.use(express.session({
        secret: 'secret',
        key: 'express.sid',
        store: this.SessionStore
    }));
    this.use(passport.initialize());
    this.use(passport.session());
    this.use(this.router);

    this.trigger('mount:routes');
    this.get('/', function(req, res, next) {
        if (!req.user) { return res.send(403, {error: 'Not Authorized'}); }
        res.send(req.user);
    });

    var logoutRedirect = this.request('logoutRedirect');
    this.del('/', function(req, res){
        req.logout();
        this.trigger('after:logout', logoutRedirect);
        res.send(302, { Location: logoutRedirect });
    }.bind(this));

}, this);

Graft.Server.on('listen', function(Server) {
    Graft.Server.use('/auth', this);
    debug('Mounting auth server', this.routes);
}, this);
