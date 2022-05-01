
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

// var mysql = require('mysql2');

// //mySQL connection
// var con = mysql.createConnection({
//   host: "127.0.0.1",
//   user: "root",
//   password: "",
//   database: "assignment6"
// });

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

app.post("/login", function (req, res) {
  res.setHeader("Content-Type", "application/json");

  console.log("What was sent", req.email, req.password);

  // check to see if the user name matches
  /*
   * IMPORTANT: THIS IS WHERE YOU WOULD PERFORM A CHECK IN THE DB INSTEAD OF
   *            HARD CODING THE VALUES HERE !!!
   */
  if (req.email == "dbui@bcit.ca" && req.password == "abc123") {
      // user authenticated, create a session
      req.session.loggedIn = true;
      req.session.email = "dbui@bcit.ca";
      req.session.name = "Devon";
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
// app.listen(port, init);
