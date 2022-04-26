
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

var mysql = require('mysql2');

//mySQL connection
var con = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "",
  database: "assignment6"
});

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


// RUN SERVER
let port = 8000;
app.listen(port, init);
