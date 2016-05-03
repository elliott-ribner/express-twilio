var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var adminSchema = new Schema({
  email: String,
  password: String
});

var AdminUser = mongoose.model('AdminUser', adminSchema);

module.exports = AdminUser;