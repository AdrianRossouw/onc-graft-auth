var Graft = require('graftjs/server');

Graft.system('Auth', 'auth');

require('./auth/Auth.graft.js');
