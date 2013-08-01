var Strategy = require('passport-dummy').Strategy;


this.addInitializer(function(opts) {
    this.strategy = Graft.Auth.request('createStrategy', 'dummy', Strategy, {});
    Graft.Auth.execute('mount', 'dummy', Strategy);
});

Graft.Auth.commands.setHandler('verify:dummy', function(done) {
    done(null, {id: 'dummy'});
}, this);
