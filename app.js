//jshint esversion:6
require('dotenv').config();
const express = require("express")
const ejs = require("ejs")
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const _ = require('passport-local-mongoose');
// const bcrypt = require("bcrypt");
// const saltRound = 10;
//const md5 = require("md5");
// const encrypt = require("mongoose-encryption");   //mongoose encryption

const app = express();

app.use(express.static("public"));
app.set("view engine" , "ejs");
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
    secret: "Our Lottle secret.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://0.0.0.0:27017/userDB",{useNewUrlParser : true});

const userSchema = new mongoose.Schema ({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);
//userSchema.plugin(encrypt,{secret: process.env.SECRET , encryptedFields:["password"] }); // mongoose encryption for a particular coloum

const User = new mongoose.model("User",userSchema);

// CHANGE: USE "createStrategy" INSTEAD OF "authenticate"
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/",function(req,res){
    res.render("home");
});

app.get("/login",function(req,res){
    res.render("login");
});

app.get("/register",function(req,res){
    res.render("register");
});

/*
app.post("/register",function(req,res){

    bcrypt.hash(req.body.password,saltRound,function(err, hash){
        const newUser = new User({
            email: req.body.username,
            password: hash
        });
    
        newUser.save(function(err){
            if(err){
                console.log(err);
            } else {
                res.render("secrets")
            }

    });

    });
   
});

app.post("/login",function(req,res){
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({email:username},function(err , foundUser){
        if(err){
            console.log(err);
        } else {
            if(foundUser) {
                bcrypt.compare(password,foundUser.password,function(err,result){
                    if(result === true){
                        res.render("secrets");
                    }
                });
            }
        }
    });
});
*/

app.get("/secrets",function(req,res){
    if(req.isAuthenticated()){
        res.render("secrets");
    } else {
        res.redirect("/login");
    }
});

app.get("/logout",function(req,res){
    req.logout((err)=>{
        if(err){
            console.log(err);
        } else {
            res.redirect("/");
        }
    });
});

app.post("/register",function(req,res){
    User.register({username:req.body.username}, req.body.password, function(err,user){
        if(err){
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets")
            });
        }
    });
});

app.post("/login",function(req,res){
    const user = new User({
        username : req.body.username,
        password : req.body.password
    });

    req.login(user, function(err){
        if(err){
            console.log(err);
        } else {
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets");
            });
        }
    });
});

app.listen(3000,function(){
console.log("Successfully server started at port 3000");
});
