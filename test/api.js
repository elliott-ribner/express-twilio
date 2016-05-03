"use strict";
var chai = require('chai');
var expect = chai.expect;
var MessageRequest = require('../app/message-process');
var config = require('../server/config/config');
var Convo = require('../app/convo');
var User = require('../app/models');
var mongoose = require('mongoose');
var request = require('supertest');
var app = require('../app');
var AdminUser = require('../app/admin-user');


describe('API requests', function() {
  beforeEach(function() {
    AdminUser.find().remove().exec();
  });

  afterEach(function() {
    AdminUser.find().remove().exec();
  })

  
    it("should allow new user signup", function(done) {
    request(app)
      .post('/api/newuser')
      .send({
        email: 'elr8@gmail.com',
        password: 'password'
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(201)
      .end(function(err, res) {
        expect(res.body).to.eql({
          success: true,
          adminId: res.body.adminId,
          message: "Enjoy da token",
          token: res.body.token
        });
        done();
      });
  });

});