"use strict";
var express = require('express');
var runProcess = require('./app/message-process.js');
var app = express();
var mongoose = require('mongoose');
var config = require('./server/config/config');
//mongo creds coming from setup as described in https://devcenter.heroku.com/articles/mongolab - heroku addons create
// local db mongodb://localhost:27017/rubens
mongoose.connect(config.db.url);

runProcess('hey there','40643999','986858885', 'x2djsjd' );

app.get('/', function(req, res) {
	res.send('yep im working bud');
});

app.post('/incoming', function(request, response) {

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


