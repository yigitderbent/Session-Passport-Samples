require("dotenv").config();
const express = require('express'),
session = require('express-session'),
bodyParser = require("body-parser"),
ejs = require("ejs"),
passport = require("passport"),
Strategy = require('passport-local').Strategy,
users = require("./db/users"),
mongoose = require("mongoose");
 
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

mongoose.connect("mongodb://localhost:27017/userDB", 
{ useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
}, err=> {
  if (!err) console.log('MongoDB Connection Succeeded.');
  else console.log('Error in DB connection: ' + err);
});

passport.use(new Strategy(
    (username, password, callback)=>{
      // Find by username function needed here
      users.findByUsername(username,password, (err,user)=>{
        if(err) return callback(err);
        if(!user) return callback(null,false);
        // if(user.password != password) return callback(null,false);
        return callback(null,user);
      });
    }
  ));

passport.serializeUser(function(user, callback) {
    callback(null, user._id);
});
  
passport.deserializeUser(function(id, callback) {
    // Find by ID function needed here
    users.findById(id,(err,user)=>{
      if(err) return callback(err);
      callback(null,user);
    });
});

app.get("/",(req,res)=> res.render("home",{user:req.user}));

app.get("/login",(req,res)=> res.render("login"));

app.get("/register", (req, res)=> res.render("register"));

app.get("/profile",(req,res)=>{
    if(req.isAuthenticated()) res.render("profile",{user:req.user});
    else res.redirect("/login");
});

app.get("/logout",(req,res)=>{
    req.session.destroy(); //used instead of req.logOut()
    res.redirect("/");
});

app.post("/login",
    passport.authenticate("local",{
        successRedirect: "/profile",
        failureRedirect: "/login"
    })
);

app.post("/register", (req, res)=>{  
    users.register(req.body.username,req.body.password,(err,user)=>{
      if(err){
        console.log(err);
        res.redirect("/register");
      }
      else
        passport.authenticate("local", (err, user)=> {
            req.logIn(user, err=> {
              return res.redirect("/profile");
            });
          })(req, res);
    });    
});

app.listen(process.env.PORT || 3000, _=> console.log("Server started on port 3000."));
