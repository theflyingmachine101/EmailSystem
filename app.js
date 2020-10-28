//required packages
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
var request = require("request");
const app = express();
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const fs = require('fs')
var nodemailer = require('nodemailer');


app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(passport.initialize());


//Serializing and Deserializing User
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(id, done) {
    done(null, user);
});

//Path to save file
var path="C:\\Users\\Shikha Singh\\Desktop\\file.json";

//Setting GoogleStrategy to recieve data and save it in file
passport.use(new GoogleStrategy({
  clientID:process.env.CLIENT_ID,
 clientSecret:process.env.client_Secret,
 callbackURL: "http://localhost:3000/send-google-credentials/callback",
 passReqToCallback: true
},
function(request, accessToken, refreshToken, profile, done) {
  try {
    //Saving the profile into file system
    fs.writeFileSync(path,JSON.stringify(profile));
    done(null,profile);
  } catch (err) {
    done(err,false);
  }
}
));



//Creating Sender and Receiver of email
var sender = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.CLIENT_USER,
    pass: process.env.CLIENT_PASSWORD
  }
});

var receiver = {
  from: process.env.CLIENT_USER,
  to: process.env.CLIENT_USER,
  subject: 'Mail from QuickWork',
  text: 'Hello System has been updated '
};



//Start of application
app.listen(3000,function(){
  console.log("Server started on port 3000");
});



//To get the Google credentials hit this API using
app.get("/send-google-credentials",passport.authenticate('google', { scope:
   [ 'email', 'profile' ] })
 );


//Call Back URL for the request made to fetch info using Oauth20
app.get("/send-google-credentials/callback",passport.authenticate( 'google'),function(req,res){
  res.status(200);
  res.send("DONE");
});



//API end point to send a mail
app.get("/send-email",function(req,res){
      fs.readFile(path, function(err,data){
      if(err)
      {
        console.error(err);
        res.status(500);
        res.send("Retry");
      }
      else{
        var profile=JSON.parse(data);
        receiver.to=profile.emails[0].value;
        sender.sendMail(receiver, function(error, info){
         if (error) {
           console.log(error);
         }
         else {
           res.status(200);
           res.send("Email Sent");
         }
       });
    }
  });
});
