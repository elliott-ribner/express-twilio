"use strict";
var express = require('express');
var MessageRequest = require('./app/message-process.js');
var app = express();
var mongoose = require('mongoose');
var config = require('./server/config/config');
var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function(req, res) {
	res.send('yep im working bud');
});

app.post('/incoming', function(req, res) {
	var message = new MessageRequest(req.body.body, req.body.from, req.body.to, req.body._id);
	//console.log(req.body);
  return message.getUser().then((user) => {
    if (user) {
      return user;
    } else {
      return message.createUser();
    }
  })
  .then(() => {
    return message.findResponse();
  })
  .then(() => {
    return message.incrementStep();
  })
  .then(() => {
		res.header('Content-Type', 'text/xml');
		res.send(`<Response><Sms>${message.response}</Sms></Response>`);
  })
});

app.listen(process.env.PORT || 3000, function() {
	console.log('app is runnning on port 3000');
})


module.exports = app;