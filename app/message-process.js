"use strict";
var conversation = require('./conversation.js'); //will later be replacedd by something returned from database; search for conversation  based on number or input code and return steps which is array inside that given document
var User = require('./models.js');


class MessageRequest {
	constructor(body,sender,to,id) {
		this.body = body;
		this.sender = sender;
		this.to = to;
		this.twilioId = id;
	}
	findResponse() {
		this.response = conversation.messages[this.user.step];
		return this.response;
	}
	getUser() {
		return User.findOne({'phoneNumber': this.sender }, function(err, user) {
			this.user = user;
		}.bind(this));
	}
	createUser() {
		var user = new User({phoneNumber: this.sender, step: 0, workflowId: 'shouldBeUniqueIdentifier'});
		return user.save(function(err, user) {
			this.user = user;
		}.bind(this));
	}
	incrementStep() {
		this.user.step ++;
		return this.user.save(function(err, obj) {
			if (err) {
				//handle error
			} else {
				// nothin
			}
		})
	}
}

var runProcess = function(body,sender,to,id) {
	var message = new MessageRequest(body,sender,to,id);
	return message.getUser().then((user) => {
		if (user) {
			return user;
		} else {
			return message.createUser();
		}
	}).then(() => {
		return message.findResponse();
	}).then(() => {
		return message.incrementStep();
	}).then(() => {
		return message.response.body;
	})
}

module.exports = MessageRequest;