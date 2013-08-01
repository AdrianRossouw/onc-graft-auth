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

### To run tests

    npm test

