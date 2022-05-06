
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

//mysql connection
var mysql = require('mysql');

//mySQL connection
var con = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "",
  database: "project"
});

app.get("/", function (req, res) {
  if (req.session.loggedIn) {
      res.redirect("/profile");
  } else {

      let doc = fs.readFileSync("./app/html/index.html", "utf8");

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
  if (req.session.loggedIn) {
    if (req.session.userType) {
      let profile = fs.readFileSync("./app/html/admin.html", "utf8");
      let profileDOM = new JSDOM(profile);

      res.set("Server", "Wazubi Engine");
      res.set("X-Powered-By", "Wazubi");
      res.send(profileDOM.serialize());
    } else {
      let profile = fs.readFileSync("./app/html/profile.html", "utf8");
      let profileDOM = new JSDOM(profile);
  
  
      // great time to get the user's data and put it into the page!
      profileDOM.window.document.getElementsByTagName("title")[0].innerHTML
          = req.session.name + "'s Profile";
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
  console.log(`What was sent: Email - ${req.body.email} Password - ${req.body.password} Username - ${req.body.userName} First Name - ${req.body.firstName} Last Name - ${req.body.lastName}`);
  const mysql = require("mysql2");
  const connection = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "",
    multipleStatements: "true"
  });
  connection.connect();

  // let userRecords = "use COMP2800; INSERT INTO BBY_25_users (user_name, first_name, last_name, email, password) values ?";
  // let recordValues = [
  //   req.body.userName, req.body.firstName, req.body.lastName, req.body.email, req.body.password
  //   ];
  // connection.query(userRecords, [recordValues]);
  connection.query(`use COMP2800; INSERT INTO BBY_25_users (user_name, first_name, last_name, email, password) values (?, ?, ?, ?, ?)`, 
    [req.body.userName, req.body.firstName, req.body.lastName, req.body.email, req.body.password],
    function (error, results, fields) {
      if (error) {
          console.log(error);
      }
      console.log('Rows returned are: ', results);
      res.send({ status: "success", msg: "Record added." });

    });
  console.log("created new user");
  connection.end();
})

app.post("/login", function (req, res) {
    res.setHeader("Content-Type", "application/json");

    console.log("What was sent", req.body.email, req.body.password);

    const mysql = require("mysql2");
    const connection = mysql.createConnection({
      host: "127.0.0.1",
      user: "root",
      password: "",
      multipleStatements: "true"
    });
    connection.connect();
    const loginInfo = `USE COMP2800; SELECT * FROM BBY_25_USERS WHERE email = '${req.body.email}' AND password = '${req.body.password}';`;
    connection.query(loginInfo, function (error, results, fields) {
      if (error) {
        // change this to notify user of error
        console.log(error);
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

function init() {
  console.log("listening on port " + port + "!");
}

let port = 8000;
app.listen(port, init);
