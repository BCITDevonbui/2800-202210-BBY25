"use strict";
const express = require("express");
const session = require("express-session");
const app = express();
const fs = require("fs");
const { connect } = require("http2");
const { JSDOM } = require("jsdom");

// static path mappings
app.use("/js", express.static("./public/js"));
app.use("/css", express.static("./public/css"));
app.use("/img", express.static("./public/img"));
app.use("/fonts", express.static("./public/fonts"));
app.use("/html", express.static("./public/html"));
app.use("/media", express.static("./public/media"));

//session connection
app.use(
  session({
    secret: "extra text that no one will guess",
    name: "wazaSessionID",
    resave: false,
    // create a unique identifier for that client
    saveUninitialized: true,
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

app.get("/register", function (req, res) {
  let doc = fs.readFileSync("./app/html/register.html", "utf8");
  res.send(doc);
});

app.get("/get-catalogue", function(req, res) {
  const mysql = require("mysql2");
  const connection = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "",
    multipleStatements: "true"
  });
  connection.connect();
  connection.query("use comp2800; select * from bby_25_catalogue;",
  function (error, results, fields) {
    if(error) {
      //catch error and save to database
    } else {
      res.send({ status: "success", rows: results[1]});
    }
  })
  connection.end();
});

app.get("/cart", async function (req, res) {
  let doc = fs.readFileSync("./app/html/cart.html", "utf8");
  let docDOM = new JSDOM(doc);
  const mysql = require("mysql2/promise");
  const connection =  await mysql.createConnection({
    host:"127.0.0.1",
    user: "root",
    password: "",
    database: "COMP2800"
  });
  let cartItems="";
  const [results] = await connection.query(`SELECT contents FROM BBY_25_users_packages WHERE userID = '${req.session.identity}' ORDER BY postdate desc LIMIT 1;`);
  let contents = results[0]["contents"].split(",");
  let myPromise = new Promise(function(resolve) {
    for (let i = 0; i < contents.length; i++) {
      const answer = connection.query(`SELECT * from BBY_25_catalogue WHERE itemID = "${contents[i]}";`);
      console.log(answer);
      cartItems += buildCard(answer);
      console.log(cartItems);
    }
    resolve(cartItems);
  });
  docDOM.window.document.getElementById("cart").innerHTML = await myPromise;
  res.set("Server", "Wazubi Engine");
  res.set("X-Powered-By", "Wazubi");
  res.send(docDOM.serialize());
});

function buildCard(result){
  //reads card.html template
  let card = fs.readFileSync("./app/html/cardDelete.html", "utf8");
  let html="";
  let cardDOM = new JSDOM(card);
  //injecting variables into card DOM
  cardDOM.window.document.getElementById("cards").setAttribute("id", `${result.itemID}`);
  cardDOM.window.document.getElementById("name").setAttribute("id", `nameOfItem${result.itemID}`);
  cardDOM.window.document.getElementById(`nameOfItem${result.itemID}`).innerHTML
  = result.name;
  cardDOM.window.document.getElementById("price").setAttribute("id", `priceOfItem${result.itemID}`);
  cardDOM.window.document.getElementById(`priceOfItem${result.itemID}`).innerHTML
  = `$${result.price}`;
  cardDOM.window.document.getElementById("most_wanted").setAttribute("id", `mostWanted${result.itemID}`);
  cardDOM.window.document.getElementById(`mostWanted${result.itemID}`).innerHTML
  = (result.most_wanted ? "High Demand" : "");
  //converts card DOM into html
  html = cardDOM.serialize();
  return html;
}

app.post("/create-cart", function (req, res) {
  const mysql = require("mysql2");
  const connection = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "COMP2800",
    multipleStatements: "true"
  });
  connection.connect();
  let postDate = getDateTime();
  connection.query(`INSERT INTO BBY_25_users_packages (userID, postdate, contents) VALUES ("${req.session.identity}", "${postDate}", "${req.body.cart}");`)
  res.send({status: "success", msg : "Created new cart"});
  connection.end();
});

function getDateTime() {
  let date = new Date();
  let splitDate = String(date).split(" ");
  let month = 0;
  if(date.getMonth() + 1 < 9) {
    month = `0${date.getMonth() + 1}`;
  } else {
    month = `${date.getMonth() + 1}`;
  }
  return `${splitDate[3]}-${month}-${splitDate[2]} ${splitDate[4]}`
}

async function getAllItems(callback) {
  const mysql = require("mysql2/promise");
  const connection = await mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "COMP2800"
  });
  const [results] = await connection.query("SELECT * FROM BBY_25_catalogue");
  callback(results);
}

app.get("/package", function (req, res) {
  let doc = fs.readFileSync("./app/html/catalogue.html", "utf8");
  let docDOM = new JSDOM(doc);
  getAllItems((results) => {
    docDOM.window.document.getElementById("content").innerHTML = buildCards(results);
  }).then(() => {
    res.set("Server", "Wazubi Engine");
    res.set("X-Powered-By", "Wazubi");
    res.send(docDOM.serialize());
  });
});

function buildCards(results){
  //reads card.html template
  let card = fs.readFileSync("./app/html/cardAdd.html", "utf8");
  let html="";
  //loops through the database and prints
    results.forEach((result) => {
      let cardDOM = new JSDOM(card);
      //injecting variables into card DOM
      cardDOM.window.document.getElementById("cards").setAttribute("id", `${result.itemID}`);
      cardDOM.window.document.getElementById("name").setAttribute("id", `nameOfItem${result.itemID}`);
      cardDOM.window.document.getElementById(`nameOfItem${result.itemID}`).innerHTML
      = result.name;
      cardDOM.window.document.getElementById("price").setAttribute("id", `priceOfItem${result.itemID}`);
      cardDOM.window.document.getElementById(`priceOfItem${result.itemID}`).innerHTML
      = `$${result.price}`;
      cardDOM.window.document.getElementById("most_wanted").setAttribute("id", `mostWanted${result.itemID}`);
      cardDOM.window.document.getElementById(`mostWanted${result.itemID}`).innerHTML
      = (result.most_wanted ? "High Demand" : "");
      //converts card DOM into html
      html += cardDOM.serialize();
  });
  console.log(html);
  return html;
}

app.get("/profile", function (req, res) {
  // Check if user properly authenticated and logged in
  if (req.session.loggedIn) {
    if (req.session.userType) {
      let profile = fs.readFileSync("./app/html/adminProfile.html", "utf8");
      let profileDOM = new JSDOM(profile);

      profileDOM.window.document.getElementById("profile_name").innerHTML =
        "Welcome back " + req.session.name;

      res.set("Server", "Wazubi Engine");
      res.set("X-Powered-By", "Wazubi");
      res.send(profileDOM.serialize());
    } else {
      let profile = fs.readFileSync("./app/html/profile.html", "utf8");
      let profileDOM = new JSDOM(profile);

      profileDOM.window.document.getElementById("profile_name").innerHTML =
        "Welcome back " + req.session.name;

      res.set("Server", "Wazubi Engine");
      res.set("X-Powered-By", "Wazubi");
      res.send(profileDOM.serialize());
    }
  } else {
    // not logged in - no session and no access, redirect to home!
    res.redirect("/");
  }
});

app.post("/register", function (req, res) {
  res.setHeader("Content-Type", "application/json");
  const mysql = require("mysql2");
  const connection = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "",
    multipleStatements: "true",
  });
  connection.connect();

  let validNewUserInfo = req.body;
  //Adds new user to user table. Always non admin, since this is client facing sign up
  connection.query(
    `use COMP2800; INSERT INTO BBY_25_users (user_name, first_name, last_name, email, password, is_admin) values (?, ?, ?, ?, ?, ?)`,
    [
      validNewUserInfo.userName,
      validNewUserInfo.firstName,
      validNewUserInfo.lastName,
      validNewUserInfo.email,
      validNewUserInfo.password,
      false,
    ],
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
      });
      res.send({ status: "success", msg: "Record added." });
    }
  );
  connection.end();
});

app.post("/login", function (req, res) {
  res.setHeader("Content-Type", "application/json");
  const mysql = require("mysql2");
  const connection = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "",
    multipleStatements: "true",
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
      res.send({ status: "fail", msg: "Incorrect email or password" });
    } else {
      let validUserInfo = results[1][0];
      req.session.loggedIn = true;
      req.session.email = validUserInfo.email;
      req.session.name = validUserInfo.first_name;
      req.session.identity = validUserInfo.identity;
      req.session.userType = validUserInfo.is_admin;
      req.session.save(function (err) {
        // session saved. for analytics we could record this in db
      });
      res.send({ status: "success", msg: "Logged in." });
    }
  });
  connection.end();
});

app.get("/logout", function (req, res) {
  if (req.session) {
    req.session.destroy(function (error) {
      if (error) {
        res.status(400).send("Unable to log out");
      } else {
        // session deleted, redirect to home
        res.redirect("/");
      }
    });
  }
});

let port = 8000;
app.listen(port);
