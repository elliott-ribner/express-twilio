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
		User.findOne({'phoneNumber': this.sender },function(err, user) {
			if (err) {
				console.log(err);
			} else if (user) { // query returned and user exists
				console.log('user update',user);
				this.user = user;
				this.response = conversation.messages[user.step];
				this.incrementStep();
			} else { //query returned and user does not exist
				var user = new User({phoneNumber: this.sender, step: 0, workflowId: 'shouldBeUniqueIdentifier'});
				user.save(function(err, user) {
					this.user = user;
					this.response = conversation.messages[user.step];
					this.incrementStep;
					console.log('user create',user);
				}.bind(this));
			}
		}.bind(this));
	}
	incrementStep() {
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

var runProcess = function(body,sender,to,id) {
	var message = new MessageRequest(body,sender,to,id);
	message.findResponse();
}

module.exports = runProcess;