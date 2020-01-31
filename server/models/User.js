const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name            : String,
    username        : { type: String, unique: true },
    email           : { type: String, unique: true },
    password        : String,
    friends         : [String],
    numberOfPosts   : Number,
}); 

module.exports = mongoose.model('User', userSchema);