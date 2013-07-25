var Strategy = require('passport-dummy').Strategy;

var Passport = Graft.module('Middleware.Auth');

this.addInitializer(function(opts) {
    this.strategy = Passport.request('createStrategy', 'dummy', Strategy, {});
});
