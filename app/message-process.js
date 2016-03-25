"use strict";
var conversation = require('./conversation.js'); //will later be replacedd by something returned from database; search for conversation  based on number or input code and return steps which is array inside that given document

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
			}
		});
	}
}

var runProcess = function(body,from,to,id) {
	var message = new MessageRequest(body,from,to,id);
	message.findResponse();
}

module.exports = runProcess;