var chai = require('chai');
var should = chai.should();

var express = require('express');
var app = express();
var runProcess = require('../app/message-process.js');

//below should eventually be switched to test db rather than real db
var mongoose = require('mongoose');
//mongo creds coming from setup as described in https://devcenter.heroku.com/articles/mongolab - heroku addons create
// local db mongodb://localhost:27017/rubens
mongoose.connect('mongodb://heroku_fbn116f1:g4t312kspun05da14eisj94srl@ds045064.mlab.com:45064/heroku_fbn116f1');


describe('Message Process', function() {
	it('should return first message for new user', function(done) {
		runProcess('hey there','9788887171','986888885', 'x2djsjd' )
		.then(() => {
			expect(1).to.eql(true);
		})
	});
});

