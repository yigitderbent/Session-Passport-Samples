require("dotenv").config();
const express = require('express'),
session = require('express-session'),
bodyParser = require("body-parser"),
ejs = require("ejs"),
passport = require("passport"),
User = require("./db/users"),
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

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/",(req,res)=> res.render("home",{user:req.user}));

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
