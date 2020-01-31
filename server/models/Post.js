const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    username   : String,
    link       : String,
    likes      : Number,
    dislikes   : Number,
    caption    : String,
    postId     : String,
    date       : Date
});

module.exports = mongoose.model('Post', postSchema);