var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/rubens';

var express = require('express');
var app = express();


app.get('/', function(req, res) {
	res.send('yep im working bud');
});

app.post('/incoming', function(request, response) {
	console.log(request);
	
	response.header('Content-Type', 'text/xml');
	response.send('<Response><Sms>This is my next message</Sms></Response>')
});

app.listen(process.env.PORT || 3000, function() {
	console.log('app is runnning on port 3000');
})


var insertDocument = function(db, callback) {
	db.collection('users').insertOne({
		"phoneNumber":"9875756453",
		"step": 0
	}, function(err, result) {
		assert.equal(err,null);
		console.log("inserted a document");
		callback();
	});
}

MongoClient.connect(url, function(err,db) {
	assert.equal(null, err);
	insertDocument(db, function() {
		db.close();
	});	
})