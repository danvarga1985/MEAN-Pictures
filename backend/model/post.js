const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    default: 'Default Content'
  },
  imagePath: {
    type: String,
    required: true
  }
});

// Export module - 'model' should be Upper Case
module.exports = mongoose.model('Post', postSchema);
