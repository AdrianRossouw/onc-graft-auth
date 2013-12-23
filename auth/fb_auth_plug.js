var Graft = require('graftjs/server');
var express = require('express');
var passport = require('passport');
var _ = require('underscore');

var MemoryStore = express.session.MemoryStore;
var sessionStore  = new MemoryStore();
Graft.use(express.session({
    secret: 'secret',
    key: 'express.sid',
    store: sessionStore
}));
Graft.use(passport.initialize());
Graft.use(passport.session());

// ==== FB AUTH PASSPORT PLUG (START) (I.C)
var fb_passport_plugin = {
  actions: {
    authorize: function(req, object) {
      var r_data = {};
      if(req !== null && !_.isEmpty(object)) {
        req.session.passport = object;
        r_data = {
          status: true,
          msg: "OK",
          session: req.session.passport
        };
      } else {
        r_data = {
          status: false,
          msg: "Illegal incoming params",
          session: null
        };
      }
      return r_data;
    },
    deauthorize: function(req) {
      var r_data = {};
      if(req !== null) {
        req.session.passport = {};
        r_data = {
          status: true,
          msg: "OK",
          session: req.session.passport
        };
      } else {
        r_data = {
          status: false,
          msg: "Illegal incoming params",
          session: null
        };
      }
      return r_data;
    },
    get_session_data: function(req) {
      var r_data = {};
      if(req !== null) {
        r_data = {
          status: true,
          msg: "OK",
          session: req.session.passport
        };
      } else {
        r_data = {
          status: false,
          msg: "Illegal incoming params",
          session: null
        };
      }
      return r_data;
    }
  }
}

module.exports = fb_passport_plugin;
// ==== FB AUTH PASSPORT PLUG (START) (I.C)