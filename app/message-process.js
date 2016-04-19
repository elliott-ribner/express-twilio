"use strict";
let User = require('./models');
let Convo = require('./convo');
let helpers = require('./helpers');

class MessageRequest {
	constructor(body,sender,to,id) {
		this.body = body;
		this.sender = sender;
		this.to = to;
		this.twilioId = id;
	}
	findResponse() {
		return Convo.findOne({phoneNumber: this.to}) // right now there is only one convo but in the futrue we will to search them
		.then((convo) => {
			if (convo.convoSteps[this.user.step]) {
				this.response = convo.convoSteps[this.user.step].body;
				if (this.user.step > 0) { // save prev response to be saved with the message the user sent
					this.previousPrompt = convo.convoSteps[this.user.step -1].body;
					//this.validResponse = validResponseType(this.body, convo.convoSteps[this.user.step -1].expectedResponse);
				}
				return this.response;
			} else {
				this.response = convo.defaultResponse;
				return this.response;
			}
		});
	}
	saveResponse() {
		if (!this.previousPrompt) {
			return;
		}
		let response = {question: this.previousPrompt, userReply: this.body };
		return User.findOneAndUpdate({_id:this.user._id}, {$push: {responses: response}},{upsert: true}, function(err, doc) {});

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