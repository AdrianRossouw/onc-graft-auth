var passport = require('passport'),
    strategy = require('passport-local').Strategy;

server = servers.Passport.extend({
    key: 'local',
    strategy: strategy,
    verify: function(username, password, done) {
        var user = {id: username};
        return done(null, user);
    }
});

server.augment({
    initialize: function(parent, app) {
        parent.call(this, app);
        console.log('mounting ' + this.key + ' authentication strategy');
        this.post('/auth/' + this.key, passport.authenticate(this.key, {
            successRedirect: '/',
         //   failureRedirect: '/error'
        }));
    }
});

