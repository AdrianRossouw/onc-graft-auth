var passport = require('passport'),
  strategy = require('passport-local').Strategy;

this.addInitializer(function(opts) {
  this.strategy = Graft.Auth.request('createStrategy', 'local', strategy, {});

  Graft.Auth.execute('mount', 'local', strategy, 'post');
});

Graft.Auth.commands.setHandler('verify:local', function(username, password, done) {
    var user = new Graft.Auth.Model({id: username});
    user.fetch().then(doneFn, failFn);

    function failFn(model, res, options) {
        done('Username not found!');
    }

    function doneFn(model, res, opts) {
        if(user.get('id') == username) {
            if(user.get('password') == user.hash(password)) {
                done(null, user);
            } else {
                done('Incorrect password!');
            }
        } else {
            done('Unknown error!');
        }

    }
}, this);
