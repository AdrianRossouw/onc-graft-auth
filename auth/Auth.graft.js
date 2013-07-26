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
this.AuthModel = this.AuthModel || Graft.BaseModel;

// Set a SessionStore to use for storing sessions.
this.SessionStore = this.SessionStore || new MemoryStore({ 
    reapInterval: 60000 * 10
});


this.commands.setHandler('deserialize', function(obj, done) {
    done(null, new this.AuthModel(obj));
});

this.commands.setHandler('serialize', function(user, done) {
    done(null, user);
});

this.commands.setHandler('verify', function() {
    done(null, false, { message: 'No Authentication Strategy' });
});

this.addInitializer(function(options) {
    // Passport session setup.
    passport.serializeUser(_.partial(this.execute, 'serialize'));
    passport.deserializeUser(_.partial(this.execute, 'deserialize'));
});

this.reqres.setHandler('failureRedirect', _.f.functionize('/error'));
this.reqres.setHandler('successRedirect', _.f.functionize('/'));
this.reqres.aliasHandler('logoutRedirect', 'successRedirect');

this.commands.setHandler('mount', function(key, strategy, method) {
    var method = method || 'get';

    var opts = {
        successRedirect: this.request('successRedirect'),
        failureRedirect: this.request('failureRedirect')
    };

    this[method]('/auth/' + key, passport.authenticate(key, opts));
}, this);

this.reqres.setHandler('createStrategy', function(key, Strategy, opts) {
    var opts = opts || {};
    var verifyFn = _.partial(this.command, 'verify:'+key);

    var strategy = new Strategy(verifyFn, opts);
    strategy.name = key;

    this.passport.use(key, strategy);
}, this);

this.addInitializer(function middleware(opts) {
    this.use(express.cookieParser());
    this.use(express.session({secret: 'secret', key: 'express.sid'}));
    this.use(passport.initialize());
    this.use(passport.session());
    this.use(this.router);
});

this.addInitializer(function(options) {
    this.trigger('mountRoutes');

    var logoutRedirect = this.request('logoutRedirect');
    this.get('/logout', function(req, res){
        req.logout();
        res.redirect(logoutRedirect);
    });
});
