const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const friendSchema = new Schema({
    toUser   : String,
    fromUser : String,
    done     : Boolean,
    requestId: String,
    time     : Date,
});

module.exports = mongoose.model('FriendRequest', friendSchema);