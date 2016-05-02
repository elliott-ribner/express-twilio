var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
	phoneNumber: String,
	step: Number,
	workflowId: String,
  password: String,
  email: String,
  responses: [{question: String, userReply:String}]
});

var User = mongoose.model('User', userSchema);

module.exports = User;