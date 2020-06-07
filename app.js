require("dotenv").config();
const express = require('express'),
session = require('express-session'),
bodyParser = require("body-parser"),
ejs = require("ejs"),
passport = require("passport"),
User = require("./db/users"),
mongoose = require("mongoose"),
GoogleStrategy = require('passport-google-oauth20').Strategy;
 
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

app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/secrets"
},
(accessToken, refreshToken, profile, cb)=>
  User.findOrCreate({ googleId: profile.id }, (err, user)=>{ return cb(err, user);})
));

mongoose.connect("mongodb://localhost:27017/userDB", 
{ useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
}, err=> {
  if (!err) console.log('MongoDB Connection Succeeded.');
  else console.log('Error in DB connection: ' + err);
});

passport.use(User.createStrategy());

passport.serializeUser((user, done)=> done(null, user.id));

passport.deserializeUser((id, done)=>{
  User.findById(id, (err, user)=> done(err, user));
});

app.get("/",(req,res)=> res.render("home",{user:req.user}));

app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile"] }));

app.get("/auth/google/secrets", 
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res)=>{
    // Successful authentication, redirect to profile page.
    res.redirect("/profile");
});

app.get("/login",(req,res)=> res.render("login"));

app.get("/register", (req, res)=> res.render("register"));

app.get("/profile",(req,res)=>{
    if(req.isAuthenticated()) res.render("profile",{user:req.user});
    else res.redirect("/login");
});

app.get("/logout",(req,res)=>{
    req.session.destroy();
    res.redirect("/");
});

app.post("/login",
    passport.authenticate("local",{
        successRedirect: "/profile",
        failureRedirect: "/login"
    })
);

app.post("/register", (req, res)=>{
  User.register({username:req.body.username},req.body.password,(err,user)=>{
    if(err){
      console.log(err);
      res.redirect("/register");
    }
    else
      passport.authenticate("local")(req,res,_=> res.redirect("/profile"));
  });
});

app.listen(process.env.PORT || 3000, _=> console.log("Server started on port 3000."));
