
const express = require("express");
const session = require("express-session");
const app = express();
const fs = require("fs");
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

app.get("/profile", function (req, res) {
  if (req.session.loggedIn) {
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

  } else {
      // not logged in - no session and no access, redirect to home!
      res.redirect("/");
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.post("/login", function (req, res) {
    res.setHeader("Content-Type", "application/json");

     console.log("What was sent", req.body.email, req.body.password);

     const mysql = require("mysql2");
     const connection =  mysql.createConnection({
       host: "127.0.0.1",
       user: "root",
       password: "",
       multipleStatements: "true"
     });
     connection.connect();

    const loginInfo = "use project2800; SELECT * FROM users WHERE email = '" + req.body.email + "';";
    connection.query(loginInfo,
      function (error, results, fields) {
        // results is an array of records, in JSON format
        // fields contains extra meta data about results
        console.log("Results from DB", results, "and the # of records returned", results.length);
        // // hmm, what's this?
        // myResults = results;
        if (error) {
            // in production, you'd really want to send an email to admin
            // or in the very least, log it. But for now, just console
            console.log(error);
        } else if ((req.body.email == results[1][0]["email"] && req.body.password == results[1][0]["password"]) {
          // user authenticated, create a session
          req.session.loggedIn = true;
          req.session.email = results[1][0]["email"];
          req.session.name = results[1][0]["first_name"];
          req.session.ID = results[1][0]["ID"];
          req.session.save(function (err) {
              // session saved. For analytics, we could record this in a DB
          });
          // all we are doing as a server is telling the client that they
          // are logged in, it is up to them to switch to the profile page
          res.send({ status: "success", msg: "Logged in." });
        } else {
          // server couldn't find that, so use AJAX response and inform
          // the user. when we get success, we will do a complete page
          // change. Ask why we would do this in lecture/lab :)
          res.send({ status: "fail", msg: "User account not found." });
          }
        connection.end();
      })
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

async function init() {
  const mysql = require("mysql2/promise");
  const connection = await mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "",
    multipleStatements: "true"
  });

  const createDBAndTables = `CREATE DATABASE IF NOT EXISTS COMP2800;
  use project2800;
  CREATE TABLE IF NOT EXISTS BBY_25_users (
  ID int NOT NULL AUTO_INCREMENT,
  user_name varchar(30),
  first_name varchar(30),
  last_name varchar(30),
  email varchar(30),
  password varchar(30),
  PRIMARY KEY (ID));
  CREATE TABLE IF NOT EXISTS BBY_25_users_packages (
  userID int NOT NULL,
  packageID int NOT NULL AUTO_INCREMENT,
  postdate DATE,
  posttext varchar(300),
  posttime TIME,
  PRIMARY KEY(packageID),
  CONSTRAINT A00849214_user
  FOREIGN KEY (userID)
    REFERENCES users(ID));
  CREATE TABLE IF NOT EXISTS BBY_25_admin_users (
    ID int NOT NULL AUTO_INCREMENT,
    user_name varchar(30),
    first_name varchar(30),
    last_name varchar(30),
    email varchar(30),
    password varchar(30),
    PRIMARY KEY(ID));`;

  await connection.query(createDBAndTables);

  const [rows, fields] = await connection.query(`SELECT * FROM users`);

  if (rows.length == 0) {
    let userRecords = `INSERT INTO users (user_name, first_name, last_name, email, password) values ?`;
    let recordValues = [
      ["pdychinco", "Princeton", "Dychinco", "pdychinco@bcit.ca", "test1"],
      ["idatayan", "Izabelle", "Datayan", "idatayan@bcit.ca", "test2"],
      ["dbui", "Devon", "Bui", "dbui@bcit.ca", "test3"],
      ["damah", "David", "Amah", "damah@bcit.ca", "test4"]
    ];
    await connection.query(userRecords, [recordValues]);
  }

  const [lines, titles] = await connection.query(`SELECT * FROM admin_users`);

  if (lines.length == 0) {
    let userRecords = `INSERT INTO admin_users (user_name, first_name, last_name, email, password) values ?`;
    let recordValues = [
      ["pdychinco", "Princeton", "Dychinco", "pdychinco@bcit.ca", "test1"],
      ["idatayan", "Izabelle", "Datayan", "idatayan@bcit.ca", "test2"],
      ["dbui", "Devon", "Bui", "dbui@bcit.ca", "test3"],
      ["damah", "David", "Amah", "damah@bcit.ca", "test4"]
    ];
    await connection.query(userRecords, [recordValues]);
  }

  connection.end();

  console.log("listening on port " + port + "!");
}
// test code
// gotta merge now
let port = 8000;
app.listen(port, init);
// dev branch commit