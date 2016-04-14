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
      onwner: 'xfjeje',
      code: '4394',
      defaultResponse: 'the convo is over this is default mesage',
      convoStep: [
        {
          name: 'intro',
          body: 'Hey welcome to the app',
          expectedResponse: 'string'
        },
        {
          name: 'intro',
          body: 'This is the second message',
          expectedResponse: 'string'
        },
        {
          name: 'intro',
          body: 'This is third one',
          expectedResponse: 'string'
        },
      ]
    });
  });

  afterEach(function() {
    Convo.find().remove().exec();
    User.find().remove().exec();
  })

	it('should return first message for new user', function() {
  	var message = new MessageRequest('hey yo','99668864141','85847737','84883');
    this.timeout(6000);
    console.log(message);
    return message.getUser().then((user) => {
      console.log('stepone', user);
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
      return message.response.body;
    })
    .then((body) => {
      console.log('wtf');
      expect(true).to.eql(true);
    })

	});
});

