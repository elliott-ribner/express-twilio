"use strict";
var conversation = require('./conversation.js'); //will later be replacedd by something returned from database; search for conversation  based on number or input code and return steps which is array inside that given document
var User = require('./models.js');


class MessageRequest {
	contructor(body,from,to,id) {
		this.body = body;
		this.from = from;
		this.to = to;
		this.twilioId = id;
	}
	findResponse() {
		User.findOne({'phoneNumber': this.from },function(err, user) {
			if (err) {
				console.log(err);
			} else {
				console.log(user);
				this.user = user;
				this.response = conversation.messages[user.step];
				this.incrementStep();
			}
		}.bind(this));
	}
	incrementStep() {
		console.log(this.response.body);
		this.user.step ++;
		this.user.save(function(err, obj) {
			if (err) {
				console.log(err);
			} else {
				console.log(obj);
			}
		})
	}
}

var runProcess = function(body,from,to,id) {
	var message = new MessageRequest(body,from,to,id);
	message.findResponse();
}

module.exports = runProcess;