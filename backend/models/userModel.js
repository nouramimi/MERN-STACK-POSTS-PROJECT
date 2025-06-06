const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const  UserSchema = Schema({
  name : { type: String, required: true },
  email : { type: String },
  password : {type: String },
});

module.exports = mongoose.model('User', UserSchema);