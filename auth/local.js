var passport = require('passport'),
  strategy = require('passport-local').Strategy;

this.addInitializer(function(opts) {
  this.strategy = Graft.Auth.request('createStrategy', 'local', strategy, {});

  Graft.Auth.execute('mount', 'local', strategy);
});

Graft.Auth.commands.setHandler('verify:local', function(username, password, done) {
//  if(username != 'user')
//    done('Error', {id: 'local'});
//  else
    done(null, {id: 'local'})
}, this);