var Strategy = require('passport-dummy').Strategy;


this.addInitializer(function(opts) {
    this.strategy = Graft.Middleware.Auth.request('createStrategy', 'dummy', Strategy, {});

});
