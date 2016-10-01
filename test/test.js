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

mongoose.createConnection(config.db.url);
console.log(config.db.url);
describe('API requests', function() {
  before(function() {
    Convo.find().remove().exec();
    User.find().remove().exec();
  });

  beforeEach(function() {
    var convo = new Convo({
      owner: 'xfjeje',
      phoneNumber: '7778889999',
      defaultResponse: 'the convo is over this is default mesage',
      convoSteps: [
        {
          name: 'intro',
          body: 'Whats your first name',
          expectedResponse: 'String'
        },
        {
          name: 'intro',
          body: 'Whats your last name',
          expectedResponse: 'String'
        },
        {
          name: 'intro',
          body: 'How many people are in your party',
          expectedResponse: 'Number'
        },
      ]
    });
    convo.save();
  });

  afterEach(function() {
    Convo.find().remove().exec();
    User.find().remove().exec();
    AdminUser.find().remove().exec();

  });

  it("should allow valid post request for new user", function(done) {
    request(app)
      .post('/incoming')
      .send({
        body: 'yo whats up',
        From: '+19991112222',
        To: '+17778889999',
        _id: 'x9382'
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', '/text/xml')
      .expect(201)
      .end(function(err,resp) {
        expect(resp.text).to.equal('<Response><Sms>Whats your first name</Sms></Response>');
        return User.findOne({phoneNumber: "9991112222"})
        .then((user)=> {
          expect(user.phoneNumber).to.eql("9991112222")
          done();
        })
      })
  });

})

describe('Message Process', function() {
  
  before(function() {
    Convo.find().remove().exec();
    User.find().remove().exec();
  });

  beforeEach(function() {
    var convo = new Convo({
      owner: 'xfjeje',
      phoneNumber: '7778889999',
      defaultResponse: 'the convo is over this is default mesage',
      convoSteps: [
        {
          name: 'intro',
          body: 'Whats your first name',
          expectedResponse: 'String'
        },
        {
          name: 'intro',
          body: 'Whats your last name',
          expectedResponse: 'String'
        },
        {
          name: 'intro',
          body: 'How many people are in your party',
          expectedResponse: 'Number'
        },
      ]
    });
    convo.save();
  });

  afterEach(function() {
    Convo.find().remove().exec();
    User.find().remove().exec();
  })

	it('should return first message for new user', function() {
  	var message = new MessageRequest('hey yo','9984141','7778889999','84883');
    return message.getUser().then((user) => {
      if (user) {
        return user;
      } else {
        return message.createUser();
      }
    })
    .then(() => {
      return message.findResponse();
    })
    .then(() => {
      return message.incrementStep();
    })
    .then(() => {
      return message.response;
    })
    .then((response) => {
      expect(response).to.eql('Whats your first name');
    })
	});
  

  it("should return second message for existing user who is already on step 1", function() {
    let phone = '9998887777'
    var user = new User({phoneNumber: phone, step: 1, workflowId: '2x'});
    user.save();
    var message = new MessageRequest('Ron', phone, '7778889999', 'xcxc');
    return message.getUser().then((user) => {
      if (user) {
        return user;
      } else {
        return message.createUser();
      }
    })
    .then(() => {
      return message.findResponse();
    })
    .then(() => {
      return message.saveUserResponse();
    })
    .then(() => {
      return message.incrementStep();
    })
    .then(() => {
      expect(message.response).to.eql('Whats your last name');
    })
    .then(() => {
      return User.findOne({phoneNumber: phone}).lean();
    }).then((queryResult) => {
      return expect(queryResult.responses[0]).to.eql({
        userReply: 'Ron',
        question: 'Whats your first name',
        _id: queryResult.responses[0]._id
      });
    })
  });

  it("should return invalid type response when inputted does not match expected type", function() {
    let phone = '9998887777'
    var user = new User({phoneNumber: phone, step: 2, workflowId: '2x'});
    user.save();
    var message = new MessageRequest('Three', phone, '7778889999', 'xcxc');
    return message.getUser().then((user) => {
      if (user) {
        return user;
      } else {
        return message.createUser();
      }
    })
    .then(() => {
      return message.findResponse();
    })
    .then(() => {
      return message.saveUserResponse();
    })
    .then(() => {
      return message.incrementStep();
    })
    .then(() => {
      expect(message.response).to.eql('Please respond with a number (i.e. 12 not twelve)');
    })
    .then(() => {
      return User.findOne({phoneNumber: phone}).lean();
    }).then((queryResult) => {
      expect(queryResult.step).to.eql(2);
    })
  });

  it('increments user to next step', function() {
    let phone = '9998887777'
    var user = new User({phoneNumber: phone, step: 1, workflowId: '2x'});
    user.save().then(() =>{
     return new MessageRequest('Ron', phone, '7778889999', 'xcxc');
    }).then((message)=> {
      return message.getUser()
    }).then((user)=> {
      return message.incrementStep();
    }).then(() => {
      return User.find({phoneNumber: phone});
    }).then((user) => {
      expect(user.step._id).to.equal(2);
    })
  });

  it('responds correctly for user who has worked through every step', function() {
    let phone = '9998887777';
    var user = new User({phoneNumber: phone, step: 6, workflowId: '2x'});
    user.save();
    var message = new MessageRequest('Ron', phone, '7778889999', 'xcxc');
    return message.getUser().then((user) => {
      if (user) {
        return user;
      } else {
        return message.createUser();
      }
    })
    .then(() => {
      return message.findResponse();
    }).then(() => {
      expect(message.response).to.equal('the convo is over this is default mesage');
    })
  })

});

