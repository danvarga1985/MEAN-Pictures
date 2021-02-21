const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true // 'unique' doesn't act as a validator - it's for mongo for internal use
  },
  password: {
    type: String,
    required: true
  }
});

// 'mongoose-unique-validator' is a plugin
userSchema.plugin(uniqueValidator);

// Export module - 'model' should be Upper Case
module.exports = mongoose.model('User', userSchema);
