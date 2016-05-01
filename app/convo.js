var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var convoSchema = new Schema({
  owner: String,
  //timestamps: true,
  code:{type: String, optional: true}, //we could user phone # or code to identify proper convo, each # has one convo, or one # can route to many convos based on opening text
  phoneNumber: {type:String, optional:true}, //we could user phone # or code to identify proper convo, each # has one convo, or one # can route to many convos based on opening text
  defaultResponse: String,
  convoSteps: [{name: String,body: String, expectedResponse: String}]
});

var Convo = mongoose.model('Convo', convoSchema);

module.exports = Convo;