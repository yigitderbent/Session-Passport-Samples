require("dotenv").config();
const express = require('express'),
session = require('express-session'),
bodyParser = require("body-parser"),
ejs = require("ejs"),
passport = require("passport"),
Strategy = require('passport-local').Strategy,
users = require("./db/users");
 
const app = express();

const secret = process.env.SECRET;

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(session({
  secret: secret,
  resave: false,
  saveUninitialized: true,
  cookie :{maxAge:10000},
  rolling: true
}));
// session timeout set to 10s, rolling option is required to reset it on every response.

app.use(passport.initialize());
app.use(passport.session());

passport.use(new Strategy(
    (username, password, callback)=>{
      // Find by username function needed here
      users.findByUsername(username,(err,user)=>{
        if(err) return callback(err);
        if(!user) return callback(null,false);
        if(user.password != password) return callback(null,false);
        return callback(null,user);
      });
    }
  ));

passport.serializeUser(function(user, callback) {
    callback(null, user.id);
});
  
passport.deserializeUser(function(id, callback) {
    // Find by ID function needed here
    users.findById(id,(err,user)=>{
      if(err) return callback(err);
      callback(null,user);
    });
});

app.get("/",(req,res)=>{
    if(req.isAuthenticated()) res.render("home",{user:req.user});
    else res.redirect("/login");
});

app.get("/login",(req,res)=>{
    res.render("login");
});

app.get("/profile",(req,res)=>{
    if(req.isAuthenticated()) res.render("profile",{user:req.user});
    else res.redirect("/login");
});

app.get("/logout",(req,res)=>{
    req.session.destroy(); //used instead of req.logOut()
    res.redirect("/login");
});

app.post("/login",
    passport.authenticate("local",{
        successRedirect: "/profile",
        failureRedirect: "/login"
    })
);

app.listen(process.env.PORT || 3000, _=>{
    console.log("Server started on port 3000.");
});
