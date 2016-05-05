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
    Convo.find().remove().exec();
    var admin = new AdminUser({email: 'abd@gmail.com', password: 'password'});
    admin.save();
  });

  
  
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

  it("allows user to authenticate and get web token", function() {
    request(app)
      .post('/api/authenticate')
      .send({
        email: 'abd@gmail.com',
        password: 'password'
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        expect(res.body.token).to.exist;
      })
  });


  
  it("allows user to post convo", function(done) {
    var admin = new AdminUser({email: 'abd@gmail.com', password: 'password'});
    admin.save();
    request(app)
      .post('/api/convo')
      .send({
        defaultResponse: 'your done thanks',
        convoSteps: [{name: 'first', body: 'hey hows your day', expectedResponse: 'String'}],
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1NzJhYjVjZDQzN2VkYzU2OTM0ZTg1ODYiLCJpYXQiOjE0NjI0MTY4NDUsImV4cCI6MTQ2MjUwMzI0NX0._2mCdSG97AtlHQ74ap7qmMbLXrG8tY8RBTV2GAoRtQM'
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err,res) {
        expect(res.body.convo.defaultResponse).to.equal('your done thanks');
        expect(res.body.convo.convoSteps).to.exist;
      })
      done();
  })

});


