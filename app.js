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