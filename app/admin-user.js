var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var adminSchema = new Schema({
  email: String,
  password: String
});

var adminUser = mongoose.model('adminUser', adminSchema);

module.exports = adminUser;