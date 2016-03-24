var express = require('express');
var app = express();

//new
var mongoose = require('mongoose');
//mongo creds coming from setup as described in https://devcenter.heroku.com/articles/mongolab - heroku addons create
mongoose.connect('mongodb://heroku_fbn116f1:g4t312kspun05da14eisj94srl@ds045064.mlab.com:45064/heroku_fbn116f1');

var User = mongoose.model('User', {phone: String, step: Number});
var user1 = new User({phone: "8889997171", step: 2});





app.get('/', function(req, res) {
	res.send('yep im working bud');
});

app.post('/incoming', function(request, response) {
	console.log(request);
	console.log('and response');
	console.log(response);

	var user1 = new User({phone: "8888888888", step: 2});

	user1.save(function(err,userObj) {
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


