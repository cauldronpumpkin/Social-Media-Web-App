const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    username   : String,
    link       : String,
    likes      : Number,
    dislikes   : Number,
    caption    : String,
    postId     : String,
    date       : Date,
    likedBy    : [String],
    dislikedBy : [String] 
});

module.exports = mongoose.model('Post', postSchema);