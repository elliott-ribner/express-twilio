var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var convoSchema = new Schema({
  owner: String,
  //timestamps: true,
  code: String,
  defaultRepsponse: String,
  convoStep: [{name: String,body: String, expectedResponse: String}]
});

var Convo = mongoose.model('Convo', convoSchema);

module.exports = Convo;