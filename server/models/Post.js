const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    user     : String,
    link     : String,
    likes    : Number,
    dislikes : Number,
    caption  : String
});

module.exports = mongoose.model('Post', postSchema);