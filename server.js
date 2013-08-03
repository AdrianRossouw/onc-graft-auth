var Graft = require('graftjs/server');

Graft.system('Auth', 'auth');

Graft.directory(__dirname);

require('./auth/');
