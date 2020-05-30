const mongoose = require("mongoose"),
passportLocalMongoose = require("passport-local-mongoose");

// passportLocalMongoose expects to have username field by default
// key field changed to username for the sake of simplicity
// drop the existing mongodb collection before running the code
const userSchema = new mongoose.Schema({
    username: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User",userSchema);