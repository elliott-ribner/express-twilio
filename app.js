"use strict";
var express = require('express');
var MessageRequest = require('./app/message-process.js');
var app = express();
var mongoose = require('mongoose');
var config = require('./server/config/config');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var jwt = require('jsonwebtoken');
var AdminUser = require('./app/admin-user');
var Convo = require('./app/convo');
var bcrypt = require('bcrypt');
var cors = require('cors');
var User = require('./app/models');

//mongo connection
var options = { server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } }, 
                replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS : 30000 } } };
var mongodbUri = config.db.url;
mongoose.connect(mongodbUri, options);
var conn = mongoose.connection;             
conn.on('error', console.error.bind(console, 'connection error:'));  
//end mongo connection section


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(morgan('dev'));

app.use('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
  next();
 });

app.options('*', function(req, res, next){
    console.log(req);
    res.end();
});

app.get('/', function(req, res) {
	res.send('yep im working bud');
});

app.post('/incoming', function(req, res) {
  var fromNumber = req.body.From.slice(2);
  var toNumber = req.body.To.slice(2);
	var message = new MessageRequest(req.body, fromNumber, toNumber, req.body.SmsMessageSid);
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
  .then(()=> {
    return message.saveUserResponse();
  })
  .then(() => {
    return message.incrementStep();
  })
  .then(() => {
		res.header('Content-Type', 'text/xml');
		res.send(`<Response><Sms>${message.response}</Sms></Response>`);
  })
});

var apiRoutes = express.Router();

app.set('secret', config.secret);

apiRoutes.post('/newuser', function(req,res) {
  var hash = bcrypt.hashSync(req.body.password, 10);
  var admin = new AdminUser({email: req.body.email, password: hash});
  admin.save(function(err, admin ) {
    if (err) throw err;
    var token = jwt.sign(admin._id, app.get('secret'), {
          expiresIn: "1 day"
        });
    res.json({
      success: true,
      adminId: admin._id,
      message: 'Enjoy da token',
      token: token
    });
  })
  
  
});

apiRoutes.post('/authenticate', function(req, res) {
  AdminUser.findOne({email: req.body.email}, function(err, user) {
    if(err) throw err;
    if (!user) {
      res.json({success: false, message: 'Authentication failed'});
    } else if (user) {
      var pwMatch = bcrypt.compareSync(req.body.password, user.password);
      if(pwMatch) {
        var token = jwt.sign({_id:user._id}, app.get('secret'), {
          expiresIn: "1 day"
        });
        res.status(200).send({
          success: true,
          message: 'Enjoy da token',
          token: token,
          adminId: user._id
        });
      } else {
        res.json({success: false, message: 'Authentication failed'})
      }
    }
  })
});

apiRoutes.use(function(req, res, next) {
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  if (token) {
    jwt.verify(token, app.get('secret'), function(err, decoded) {
      if (err) {
        return res.json({success: false, message: 'Failed to authenticate token'});
      } else  {
        AdminUser.findOne({_id: decoded._id}).then((user) => {
          if (user) {
            req.decoded = decoded;
            next();
          } else {
            return res.json({success: false, message: 'no user found, failed to authenticate token'});
          }
        });
      } 
    })
  } else {
    return res.status(403).send({
      success: false,
      message: 'No token provided'
    });
  }
})

apiRoutes.post('/convo', function(req, res) {
  var convo = new Convo({owner: req.decoded._id,  defaultResponse: req.body.defaultResponse, convoSteps: req.body.convoSteps });
  return convo.save(function(err,convo) {
    if (err) {
      return res.status(400).send({
        success: false,
        message: 'error occured',
        err
      });
    } else {
      return res.json({success: true, convo});
    }
  })
});

apiRoutes.get('/convos', function(req, res) {
  Convo.find({owner: req.body.userId}, function(err, result) {
    if (err) {
      return res.json({success: false, message: 'error with search'});
    } else {
      return res.json({success: true, data: result});
    }
  })
});

apiRoutes.get('/responses', function(req, res) {
  let wfId = req.body.workflowId;
  let responseArray = [[]];
  return Convo.findOne({_id: wfId})
  .then((convo) => {
    let steps = convo.convoSteps;
    steps.forEach(function(step) {
      responseArray[0].push(step.name);
    });
    responseArray[0].unshift("Phone Number");
  })
  .then(() => {
    return User.find({workflowId: wfId});
  })
  .then((users) => {
    users.forEach(function(user) {
      let userResponses = [user.phoneNumber];
      user.responses.forEach(function(response) {
        userResponses.push(response.userReply)
      });
      responseArray.push(userResponses);
    });
  }).then(() => {
    return res.json({success: true, csvArray: responseArray});
  })
})

app.use('/api', apiRoutes);


app.listen(process.env.PORT || 4000, function() {
	console.log(`app is runnning on port ${process.env.PORT || 4000}`);
})


module.exports = app;