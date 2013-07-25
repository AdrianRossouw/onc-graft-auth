var Strategy = require('passport-dummy').Strategy;

var Passport = Graft.module('Middleware.Passport');

this.addInitializer(function(opts) {
    this.strategy = Passport.request('createStrategy', 'dummy', Strategy, {});
});
