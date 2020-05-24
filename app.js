require("dotenv").config();
const express = require('express'),
session = require('express-session');
 
const app = express();

const secret = process.env.SECRET;
 
app.use(session({
  secret: secret,
  resave: false,
  saveUninitialized: true
}));

// middleware request which will be executed for every path
app.use((req, res, next) =>{
    req.session.views = (req.session.views || 0) + 1;
    next();
});

app.get("/",(req,res)=>{
    console.log("Seesion ID  ",req.session.id);
    res.send("You viewed this page " + req.session.views +  " times");
});

app.listen(process.env.PORT || 3000, _=>{
    console.log("Server started on port 3000.");
});