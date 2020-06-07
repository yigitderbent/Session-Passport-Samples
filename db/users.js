const mongoose = require("mongoose"),
passportLocalMongoose = require("passport-local-mongoose"),
findOrCreate = require("mongoose-findorcreate");

// passportLocalMongoose expects to have username field by default
// key field changed to username for the sake of simplicity
// drop the existing mongodb collection before running the code
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    googleId: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

module.exports = mongoose.model("User",userSchema);