var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
	phoneNumber: String,
	step: Number,
	workflowId: String,
});

var User = mongoose.model('User', userSchema);

module.exports = User;