var passport = require('passport'),
  strategy = require('passport-local').Strategy;

this.addInitializer(function(opts) {
  this.strategy = Graft.Auth.request('createStrategy', 'local', strategy, {});

  Graft.Auth.execute('mount', 'local', strategy, 'post');
});

Graft.Auth.commands.setHandler('verify:local', function(username, password, done) {
  var user = new Graft.Auth.Model();
  if(user.get('username') == username) {
    if(user.get('password') == user.hash(password)) {
      done(null, { id: user.get('username') });
    } else {
      done('Incorrect password!', user);
    }
  } else {
    done('Username not found!', user);
  }
//  user.fetch({
//    error: function(model, res, opts) {
//      done(res, user);
//    },
//    success: function() {
//      console.log('Success');
//      done(null, {id: 'local'});
//    }
//  })
  //console.log(user.hash(password));
}, this);
