'use strict';
const express = require("express");
const session = require("express-session");
const app = express();
const fs = require("fs");
const { connect } = require("http2");
const { JSDOM } = require('jsdom');

// static path mappings
app.use("/js", express.static("./public/js"));
app.use("/css", express.static("./public/css"));
app.use("/img", express.static("./public/img"));
app.use("/fonts", express.static("./public/fonts"));
app.use("/html", express.static("./public/html"));
app.use("/media", express.static("./public/media"));


//session connection
app.use(session(
  {
      secret: "extra text that no one will guess",
      name: "wazaSessionID",
      resave: false,
      // create a unique identifier for that client
      saveUninitialized: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.get("/", function (req, res) {
  if (req.session.loggedIn) {
      res.redirect("/profile");
  } else {

      let doc = fs.readFileSync("./app/html/login.html", "utf8");

      res.set("Server", "Wazubi Engine");
      res.set("X-Powered-By", "Wazubi");
      res.send(doc);
  }
});

app.get("/register", function (req,res) {
  let doc = fs.readFileSync("./app/html/register.html","utf8");
  res.send(doc)
})

app.get("/template", function (req,res) {
  let doc = fs.readFileSync("./app/html/template.html","utf8");
  res.send(doc)
})

app.get("/profile", function (req, res) {
  // Check if user properly authenticated and logged in
  if (req.session.loggedIn) {
    if (req.session.userType) {
    let profile = fs.readFileSync("./app/html/adminProfile.html", "utf8");
    let profileDOM = new JSDOM(profile);

      profileDOM.window.document.getElementById("profile_name").innerHTML
          = "Welcome back " + req.session.name;

      res.set("Server", "Wazubi Engine");
      res.set("X-Powered-By", "Wazubi");
      res.send(profileDOM.serialize());
    } else {
      let profile = fs.readFileSync("./app/html/profile.html", "utf8");
      let profileDOM = new JSDOM(profile);
  
      profileDOM.window.document.getElementById("profile_name").innerHTML
          = "Welcome back " + req.session.name;
  
      res.set("Server", "Wazubi Engine");
      res.set("X-Powered-By", "Wazubi");
      res.send(profileDOM.serialize());
    }
  } else {
      // not logged in - no session and no access, redirect to home!
      res.redirect("/");
  }
});

app.post("/register", function(req, res) {
  res.setHeader("Content-Type", "application/json");
  const mysql = require("mysql2");
const connection = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "",
  multipleStatements: "true"
});
  connection.connect();

  let validNewUserInfo = req.body;
  //Adds new user to user table. Always non admin, since this is client facing sign up
  connection.query(`use COMP2800; INSERT INTO BBY_25_users (user_name, first_name, last_name, email, password, is_admin) values (?, ?, ?, ?, ?, ?)`, 
    [validNewUserInfo.userName, validNewUserInfo.firstName, validNewUserInfo.lastName, validNewUserInfo.email, validNewUserInfo.password, false],
    function (error, results, fields) {
      if (error) {
        // send error to DB
      }
      //Saves information into session
      req.session.loggedIn = true;
      req.session.email = validNewUserInfo.email;
      req.session.name = validNewUserInfo.firstName;
      req.session.identity = validNewUserInfo.ID;
      req.session.userType = validNewUserInfo.is_admin;
      req.session.save(function (err) {
        // session saved. for analytics we could record this in db
      })
      res.send({ status: "success", msg: "Record added." });

    });
  connection.end();
})

app.post("/login", function (req, res) {
    res.setHeader("Content-Type", "application/json");
    const mysql = require("mysql2");
const connection = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "",
  multipleStatements: "true"
});
    
    connection.connect();
    // Checks if user typed in matching email and password
    const loginInfo = `USE COMP2800; SELECT * FROM BBY_25_USERS WHERE email = '${req.body.email}' AND password = '${req.body.password}';`;
    connection.query(loginInfo, function (error, results, fields) {
      /* If there is an error, alert user of error
      *  If the length of results array is 0, then there was no matches in database
      *  If no error, then it is valid login and save info for session
      */ 
      if (error) {
        // change this to notify user of error
      } else if (results[1].length == 0) {
        res.send({ status: "fail", msg: "Incorrect email or password"});
      }else {
        let validUserInfo = results[1][0];
        req.session.loggedIn = true;
        req.session.email = validUserInfo.email;
        req.session.name = validUserInfo.first_name;
        req.session.identity = validUserInfo.ID;
        req.session.userType = validUserInfo.is_admin;
        req.session.save(function (err) {
        // session saved. for analytics we could record this in db
      })
      res.send({ status: "success", msg: "Logged in."});
      }
    })
  connection.end();
});

app.get("/logout", function (req, res) {

  if (req.session) {
      req.session.destroy(function (error) {
          if (error) {
              res.status(400).send("Unable to log out")
          } else {
              // session deleted, redirect to home
              res.redirect("/");
          }
      });
  }
});

let port = 8000;
app.listen(port);
