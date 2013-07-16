/**
 * Primary passport service implementation 
*/
var express  = require('express');
var http     = require('http');
var path     = require('path');
var passport = require('passport');

var _express = express();
this.express = _express;
this.server  = http.createServer(this.express);

_.extend(this, _express);


function serializeUser(user, done) {
    done(null, user);
}

function deserializeUser(obj, done) {
    done(null, new Graft.$models.Account(obj));
}

this.addInitializer(function(options) {
    // Passport session setup.
    passport.serializeUser(this.serializeUser || serializeUser);
    passport.deserializeUser(this.deserializeUser || deserializeUser);
});


// store the strategy instance in a separate variable, so we can access it easily.
var strategy = new this.strategy(this.options, this.verify);
strategy.name = this.key;

// mount the passport strategy.
passport.use(this.key, strategy);

this.use(passport.initialize());
this.use(passport.session());
this.use(this.router);

this.get('/auth/' + this.key, passport.authenticate(this.key, 
    { successRedirect: '/', failureRedirect: '/error' }));

    this.get('/logout', function(req, res){
        req.logout();
        res.redirect('/');
    });

