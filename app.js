
const express = require('express');
const bodyParser = require(`body-parser`);
const app = express();
const port = 3000;
const request = require('request');
var path = require('path');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://trainadmin:test123@ds251332.mlab.com:51332/traintrackar";
//var mLab = require('mongolab-data-api')('QcMYUxzSPh1UFvwhGMNJHciyVqHemZmC');
var session = require('express-session');
var sess;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('www/public'));
app.use(session({secret: 'traintrackarSecret'}));

app.listen(port, () => {
    console.log(`App is listening to ${port}`);
});

app.post('/signUp', function (req, res){
    console.log(req.body);
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("traintrackar");
        var myobj = req.body;
        dbo.collection("users").insertOne(myobj, function(err, res) {
          if (err) throw err;
          console.log("1 user inserted");
          db.close();
        });
      });
      res.sendFile(__dirname + '/www/confirmed.html');
});

app.get("/", (req, res) => {
    res.sendFile(__dirname + '/www/index.html');
});

app.post('/login', function (req, res) {
    sess = req.session;
    var email = req.body.email;
    var pass = req.body.password;
    
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("traintrackar");
        dbo.collection("users").findOne({ email: email}, function(err, result) {
            if (err) throw err;
            //console.log(result.email);
           // console.log(result.password);
            if (result.email === email && result.password === pass){
                console.log("success");
                sess.email = result.email;
                res.redirect('/account-dashboard');
            } 
            else {
                console.log("Credentials wrong");
            }
        db.close();
        });
      });
    
    });
    app.get("/account-dashboard", (req, res) => {
        sess = req.session;
        if (sess.email){
            res.sendFile(__dirname + '/www/account-dashboard.html');
        }
        else{
            res.redirect('/');
        }
      });
