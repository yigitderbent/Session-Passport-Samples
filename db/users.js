const mongoose = require("mongoose"),
bcrypt = require("bcrypt"),
saltRounds = 10;

const userSchema = new mongoose.Schema({
    email: {
        type:String,
        required:true,
        unique:true
    },
    password: String
});

const User = new mongoose.model("User",userSchema);

exports.findByUsername = (username, password, callback)=>{
    User.findOne({
        email: username
    }).then((user) => {
        if(user)
            bcrypt.compare(password, user.password, (err, result)=> {
                if (result === true) 
                    return callback(null,user);
                else
                    return callback(null,null);
            });
        else
            return callback(null,null);
    }).catch(err=> callback(err,null));
};

exports.findById = (id, callback)=>{
    User.findOne({_id:id},(err,user) => {
        if(!user) callback(new Error("User " + id + " does not exist"));
        return callback(null,user);
    });
};

exports.register = (username, password, callback)=>{
    bcrypt.hash(password, saltRounds, (err, hash)=>{
        const newUser = new User({email:username, password:hash});
        newUser.save((err,user) => {
            if(err) callback(err,null);
            return callback(null,user);
        });
    });
}
