"use strict";
var User = require('./models');
var Convo = require('./convo');


class MessageRequest {
	constructor(body,sender,to,id) {
		this.body = body;
		this.sender = sender;
		this.to = to;
		this.twilioId = id;
	}
	findResponse() {
		return Convo.findOne() // right now there is only one convo but in the futrue we will to search them
		.then((convo) => {
			if (convo.convoSteps[this.user.step]) {
				this.response = convo.convoSteps[this.user.step].body;
				return this.response;
			} else {
				this.reponse = convo.convoSteps.defaultResponse;
				return this.response;
			}
		});
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
		return this.user.save();
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