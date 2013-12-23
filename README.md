[![Build Status](https://travis-ci.org/ONCHoldings/graft-auth.png)](https://travis-ci.org/ONCHoldings/graft-auth)

graft-auth
==========

Pluggable authentication support for [Graft.js](https://github.com/ONCHoldings/graft.js)

Provides a wrapper around [passort.js](http://passportjs.com).

### To Install

    npm install --save graft-passport

### To Use

In your graft applications `server.js` entry point :

    // Include just the auth system
    require('graft-auth');

    // Include a specific subsystem/strategy
    require('graft-auth/auth/Dummy');

    // To change the model used for your authenticated users :
    require('./modules/Account.graft.js');
    Graft.Auth.Model = Graft.$models.Account;

### FB plugin usage
Example:
  var graft_auth = require('graft-auth');
  var fb_passport_plugin = require('graft-auth/auth/fb_auth_plug.js');
  var user_psp = {
    'auth': 'fb',
    'id': fb_id,
    'expires': expires,
    'access_token': access_token,
    'status': 'fb_user'
  };
  fb_passport_plugin.actions.authorize(req, user_psp); // ==== login example
  fb_passport_plugin.actions.deauthorize(req); // === logout example
  // fb_id // ==== FB id getted from FB SDK
  // expires // === FB access token expiration value getted from FB SDK
  // access_token // === FB access token getted from FB SDK

### To run tests

    npm test

