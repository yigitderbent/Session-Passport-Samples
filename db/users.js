const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: {
        type:String,
        required:true,
        unique:true
    },
    password: String
});

const User = new mongoose.model("User",userSchema);

exports.findByUsername = (username, callback)=>{
    User.findOne({
        email: username
    }).then((user) => {
        return callback(null,user);
    });
};

exports.findById = (id, callback)=>{
    User.findOne({_id:id},(err,user) => {
        if(!user) callback(new Error("User " + id + " does not exist"));
        return callback(null,user);
    });
};
