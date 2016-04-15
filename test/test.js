"use strict";
var chai = require('chai');
var expect = chai.expect;
var MessageRequest = require('../app/message-process');
var config = require('../server/config/config');
var Convo = require('../app/convo');
var User = require('../app/models');
var mongoose = require('mongoose');

mongoose.connect(config.db.url);


describe('Message Process', function() {
  
  before(function() {
    Convo.find().remove().exec();
    User.find().remove().exec();
  });

  beforeEach(function() {
    var convo = new Convo({
      owner: 'xfjeje',
      code: '4224',
      defaultResponse: 'the convo is over this is default mesage',
      convoSteps: [
        {
          name: 'intro',
          body: 'Whats your first name',
          expectedResponse: 'string'
        },
        {
          name: 'intro',
          body: 'Whats your last name',
          expectedResponse: 'string'
        },
        {
          name: 'intro',
          body: 'What time are you coming',
          expectedResponse: 'string'
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
  	var message = new MessageRequest('hey yo','9984141','85847737','84883');
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
    var message = new MessageRequest('Ron', phone, '9843339494', 'xcxc');
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
      return message.saveResponse();
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
      expect(queryResult.responses[0]).to.eql({
        userReply: 'Ron',
        question: 'Whats your first name',
        _id: queryResult.responses[0]._id
      });
    })
  });

  it('increments user to next step', function() {
    let phone = '9998887777'
    var user = new User({phoneNumber: phone, step: 1, workflowId: '2x'});
    user.save().then(() =>{
     return new MessageRequest('Ron', phone, '9843339494', 'xcxc');
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
    var message = new MessageRequest('Ron', phone, '9843339494', 'xcxc');
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

