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
var bcrypt = require('bcrypt');

describe('CSV API request', function() {
  let admin, convo, user1, user2, token;

  beforeEach(function() {
    let password = "password";
    var hashPass = bcrypt.hashSync(password, 10);
    return Promise.resolve()
    .then(() => {
      AdminUser.find().remove().exec();
      Convo.find().remove().exec();
      return User.find().remove().exec();
    })
    .then(() => {
      admin = new AdminUser({email: 'abd@gmail.com', password: hashPass});
      return admin.save();
    })
    .then(() => {
      convo = new Convo({
        owner: admin._id,
        defaultResponse: "Thanks for messaging with me budday",
        convoSteps: [
          {
            name: "first name",
            body: "whats your first name pal",
            expectedResponse: "String"
          },
          {
            name: "age",
            body: "How old are you?",
            expectedResponse: "Number"
          }
        ]
      });
      return convo.save();
    })
    .then(() => {
      user1 = new User({
        phoneNumber: "1112221111",
        step: 2,
        workflowId: convo._id,
        responses: [
          {
            question: "whats your first name pal",
            userReply: "Randy"
          },
          {
            question: "How old are you?",
            userReply: "24"
          }
        ]
      });
      return user1.save();
    })
    .then(() => {
      user2 = new User({
        phoneNumber: "2221112222",
        step: 2,
        workflowId: convo._id,
        responses: [
          {
            question: "whats your first name pal",
            userReply: "Sally"
          },
          {
            question: "How old are you?",
            userReply: "31"
          }
        ]
      });
      return user2.save();
    }).then(() => {
      return new Promise(function(resolve, reject) {
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
            token = res.body.token;
            resolve();
          });
      })
    })
  });

  afterEach(function() {
    AdminUser.find().remove().exec();
    Convo.find().remove().exec();
    User.find().remove().exec();
  })

  it("returns csv array at /api/repsonses", function(done) {
    request(app)
      .get('/api/responses')
      .send({workflowId: convo._id, token})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        let csvArray = res.body.csvArray;
        expect(csvArray.length).to.eql(3);
        expect(csvArray[2]).to.eql([
          "2221112222",
          "Sally",
          "31"
          ]);
        expect(csvArray[0]).to.eql([
          "Phone Number",
          "first name",
          "age"
          ]);
        done();
      })
  });

})

describe('basic API requests', function() {
  var password = 'password';

  beforeEach(function() {
    var hashPass = bcrypt.hashSync(password, 10);
    AdminUser.find().remove().exec();
    Convo.find().remove().exec();
    User.find().remove().exec();
    var admin = new AdminUser({email: 'abd@gmail.com', password: hashPass});
    admin.save();
  });

  afterEach(function() {
    AdminUser.find().remove().exec();
    Convo.find().remove().exec();
    User.find().remove().exec();
  })


  it("should allow new user signup", function(done) {
  request(app)
    .post('/api/newuser')
    .send({
      email: 'el@gmail.com',
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
      return AdminUser.findOne({_id: res.body.adminId}).then((user) => {
        expect(user.email).to.eql('el@gmail.com');
        done();
      })
      
    });
  });

  it("allows user to authenticate and get web token", function(done) {
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
        done();
      })
  });


  
  it("allows user to post convo", function(done) {
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
        var myToken = res.body.token;
          request(app)
            .post('/api/convo')
            .send({
              defaultResponse: 'your done thanks',
              convoSteps: [{name: 'first', body: 'hey hows your day', expectedResponse: 'String'}],
              token: myToken
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err,res) {
              expect(res.body.convo.defaultResponse).to.equal('your done thanks');
              expect(res.body.convo.convoSteps).to.exist;
              expect(res.body.convo.owner).to.exist;
              done();
            })
      })

  });

  it("doesnt allow user with wrong token to post convo", function(done) {
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
        var myToken = res.body.token;
          request(app)
            .post('/api/convo')
            .send({
              defaultResponse: 'your done thanks',
              convoSteps: [{name: 'first', body: 'hey hows your day', expectedResponse: 'String'}],
              token: "xfjdjfjdfjfdjf"
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err,res) {
              expect(res.body.success).to.equal(false);
              expect(res.body.message).to.equal('Failed to authenticate token')
              done();
            })
      })

  });



});


