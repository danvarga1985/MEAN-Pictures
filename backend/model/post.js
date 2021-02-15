const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, default: 'Default Content' }
});

// Export module - 'model' should be Upper Case
module.exports = mongoose.model('Post', postSchema);