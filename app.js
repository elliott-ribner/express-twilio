"use strict";
var express = require('express');
var app = express();
var runProcess = require('./app/message-process.js');

var mongoose = require('mongoose');
//mongo creds coming from setup as described in https://devcenter.heroku.com/articles/mongolab - heroku addons create
// local db mongodb://localhost:27017/rubens
mongoose.connect('mongodb://heroku_fbn116f1:g4t312kspun05da14eisj94srl@ds045064.mlab.com:45064/heroku_fbn116f1');

var Text = mongoose.model('User', {phone: String, step: Number});

runProcess('hey there','9788887171','986888885', 'x2djsjd' );



app.get('/', function(req, res) {
	res.send('yep im working bud');
});

app.post('/incoming', function(request, response) {
	console.log(request);
	console.log('and response');
	console.log(response);

	var text1 = new Text({phone: "8888888888", step: 2});

	text1.save(function(err,userObj) {
		if (err) {
			console.log(err);
		} else {
			console.log('saved successfully:', userObj);
		}
	});

	response.header('Content-Type', 'text/xml');
	response.send('<Response><Sms>This is my next message</Sms></Response>')
});

app.listen(process.env.PORT || 3000, function() {
	console.log('app is runnning on port 3000');
})


