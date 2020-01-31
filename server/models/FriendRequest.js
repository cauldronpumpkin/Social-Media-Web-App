const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const friendSchema = new Schema({
    toUser   : String,
    fromUser : String,
    time     : ,
   
});

module.exports = mongoose.model('Post', postSchema);