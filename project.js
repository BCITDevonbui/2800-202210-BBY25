"use strict";
const express = require("express");
const session = require("express-session");
const app = express();
const fs = require("fs");
const { connect } = require("http2");
const { JSDOM } = require("jsdom");
const mysql = require("mysql2");

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
app.use(
  express.urlencoded({
    extended: true,
  })
);

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

app.get("/donate", function (req, res) {
  if (req.session.loggedIn) {
    let doc = fs.readFileSync("./app/html/donation.html", "utf8");
    res.send(doc);
  } else {
    res.redirect("/");
  }
});

app.post("/donate", function (req, res) {
  const mysql = require("mysql2");
  const connection = mysql.createConnection({
    // host: "127.0.0.1",
    // user: "root",
    // password: "",
    // multipleStatements: "true"
    host: 'us-cdbr-east-05.cleardb.net',
    user: 'b16ad059f5434a',
    password: '2255f096',
    database: 'heroku_02ad04623fadaa9'
  });
    connection.connect();
  let amount = req.body.amount;
  if (amount < 0 || amount > 9999999.99 || amount === "") {
    res.send({ status: "fail", msg: "Invalid amount entered!" });
  } else {
    let date = new Date();
    let splitDate = String(date).split(" ");

    let month = 0;
    if (date.getMonth() + 1 < 9) {
      month = `0${date.getMonth() + 1}`;
    } else {
      month = `${date.getMonth() + 1}`;
    }
    let postedDate = `${splitDate[3]}-${month}-${splitDate[2]} ${splitDate[4]}`;
    connection.query(
      `use COMP2800; INSERT INTO BBY_25_users_donation (userID, postdate, amount) VALUES (?, ?, ?)`,
      [req.session.identity, postedDate, amount]
    );
    res.send({ status: "success", msg: "Record added." });
    connection.end();
  }
});

app.get("/get-catalogue", function (req, res) {
  const mysql = require("mysql2");
  const connection = mysql.createConnection({
    // host: "127.0.0.1",
    // user: "root",
    // password: "",
    // multipleStatements: "true"
    host: 'us-cdbr-east-05.cleardb.net',
    user: 'b16ad059f5434a',
    password: '2255f096',
    database: 'heroku_02ad04623fadaa9'
  });ection.connect();

  connection.query(
    "use comp2800; select * from bby_25_catalogue;",
    function (error, results, fields) {
      if (error) {
        //catch error and save to database
      } else {
        res.send({ status: "success", rows: results[1] });
      }
    }
  );
  connection.end();
});

app.get("/cart", async function (req, res) {
  let doc = fs.readFileSync("./app/html/cart.html", "utf8");
  let docDOM = new JSDOM(doc);
  const mysql = require("mysql2/promise");
  const connection = mysql.createConnection({
    // host: "127.0.0.1",
    // user: "root",
    // password: "",
    // multipleStatements: "true"
    host: 'us-cdbr-east-05.cleardb.net',
    user: 'b16ad059f5434a',
    password: '2255f096',
    database: 'heroku_02ad04623fadaa9'
  });
  connection.connect();
  let cartItems = "";
  const [results] = await connection.query(
    `SELECT contents FROM BBY_25_users_packages WHERE userID = '${req.session.identity}' ORDER BY postdate desc LIMIT 1;`
  );
  let contents = results[0]["contents"].split(",");
  let myPromise = new Promise(function (resolve) {
    for (let i = 0; i < contents.length; i++) {
      const answer = connection.query(
        `SELECT * from BBY_25_catalogue WHERE itemID = "${contents[i]}";`
      );
      cartItems += buildCard(answer);
    }
    resolve(cartItems);
  });
  docDOM.window.document.getElementById("content").innerHTML = await myPromise;
  res.set("Server", "Wazubi Engine");
  res.set("X-Powered-By", "Wazubi");
  res.send(docDOM.serialize());
});

function buildCard(result) {
  //reads card.html template
  let card = fs.readFileSync("./app/html/cardDelete.html", "utf8");
  let html = "";
  let cardDOM = new JSDOM(card);
  //injecting variables into card DOM
  cardDOM.window.document
    .getElementById("cards")
    .setAttribute("id", `${result.itemID}`);
  cardDOM.window.document
    .getElementById("name")
    .setAttribute("id", `nameOfItem${result.itemID}`);
  cardDOM.window.document.getElementById(
    `nameOfItem${result.itemID}`
  ).innerHTML = result.name;
  cardDOM.window.document
    .getElementById("price")
    .setAttribute("id", `priceOfItem${result.itemID}`);
  cardDOM.window.document.getElementById(
    `priceOfItem${result.itemID}`
  ).innerHTML = `$${result.price}`;
  cardDOM.window.document
    .getElementById("most_wanted")
    .setAttribute("id", `mostWanted${result.itemID}`);
  cardDOM.window.document.getElementById(
    `mostWanted${result.itemID}`
  ).innerHTML = result.most_wanted ? "High Demand" : "";
  //converts card DOM into html
  html = cardDOM.serialize();
  return html;
}

app.post("/create-cart", function (req, res) {
  const mysql = require("mysql2");
  const connection = mysql.createConnection({
    // host: "127.0.0.1",
    // user: "root",
    // password: "",
    // multipleStatements: "true"
    host: 'us-cdbr-east-05.cleardb.net',
    user: 'b16ad059f5434a',
    password: '2255f096',
    database: 'heroku_02ad04623fadaa9'
  });
  connection.connect();
  let postDate = getDateTime();
  connection.query(
    `INSERT INTO BBY_25_users_packages (userID, postdate, contents, purchased) VALUES ("${req.session.identity}", "${postDate}", "${req.body.cart}", false);`
  );
  res.send({ status: "success", msg: "Created new cart" });
  connection.end();
});

function getDateTime() {
  let date = new Date();
  let splitDate = String(date).split(" ");
  let month = 0;
  if (date.getMonth() + 1 < 9) {
    month = `0${date.getMonth() + 1}`;
  } else {
    month = `${date.getMonth() + 1}`;
  }
  return `${splitDate[3]}-${month}-${splitDate[2]} ${splitDate[4]}`;
}

async function getAllItems(callback) {
  const mysql = require("mysql2/promise");
  const connection = mysql.createConnection({
    // host: "127.0.0.1",
    // user: "root",
    // password: "",
    // multipleStatements: "true"
    host: 'us-cdbr-east-05.cleardb.net',
    user: 'b16ad059f5434a',
    password: '2255f096',
    database: 'heroku_02ad04623fadaa9'
  });
  connection.connect();
  const [results] = await connection.query("SELECT * FROM BBY_25_catalogue");
  callback(results);
}

app.get("/package", function (req, res) {
  let doc = fs.readFileSync("./app/html/catalogue.html", "utf8");
  let docDOM = new JSDOM(doc);
  getAllItems((results) => {
    docDOM.window.document.getElementById("content").innerHTML =
      buildCards(results);
  }).then(() => {
    res.set("Server", "Wazubi Engine");
    res.set("X-Powered-By", "Wazubi");
    res.send(docDOM.serialize());
  });
});

function buildCards(results) {
  //reads card.html template
  let card = fs.readFileSync("./app/html/cardAdd.html", "utf8");
  let html = "";
  //loops through the database and prints
  results.forEach((result) => {
    let cardDOM = new JSDOM(card);
    //injecting variables into card DOM
    cardDOM.window.document
      .getElementById("cards")
      .setAttribute("id", `${result.itemID}`);
    cardDOM.window.document
      .getElementById("name")
      .setAttribute("id", `nameOfItem${result.itemID}`);
    cardDOM.window.document.getElementById(
      `nameOfItem${result.itemID}`
    ).innerHTML = result.name;
    cardDOM.window.document
      .getElementById("price")
      .setAttribute("id", `priceOfItem${result.itemID}`);
    cardDOM.window.document.getElementById(
      `priceOfItem${result.itemID}`
    ).innerHTML = `$${result.price}`;
    cardDOM.window.document
      .getElementById("most_wanted")
      .setAttribute("id", `mostWanted${result.itemID}`);
    cardDOM.window.document.getElementById(
      `mostWanted${result.itemID}`
    ).innerHTML = result.most_wanted ? "High Demand" : "";
    //converts card DOM into html
    html += cardDOM.serialize();
  });
  return html;
}

app.get("/profile", function (req, res) {
  // Check if user properly authenticated and logged in
  if (req.session.loggedIn) {
    //if admin user
    if (req.session.userType) {
      let profile = fs.readFileSync("./app/html/adminProfile.html", "utf8");
      let profileDOM = new JSDOM(profile);

      profileDOM.window.document.getElementById("profile_name").innerHTML =
        "Welcome back " + req.session.name;
      profileDOM.window.document.getElementById("profilePicture").src =
        req.session.profilePic;

      profileDOM.window.document.getElementById("profile_name").innerHTML =
        "Welcome back " + req.session.name;
      profileDOM.window.document.getElementById("profilePicture").src =
        req.session.profilePic;

      res.set("Server", "Wazubi Engine");
      res.set("X-Powered-By", "Wazubi");
      res.send(profileDOM.serialize());
    } else {
      //if a normal user
      let profile = fs.readFileSync("./app/html/profile.html", "utf8");
      let profileDOM = new JSDOM(profile);

      profileDOM.window.document.getElementById("profile_name").innerHTML =
        "Welcome back " + req.session.name;
      profileDOM.window.document.getElementById("profilePicture").src =
        req.session.profilePic;

      res.set("Server", "Wazubi Engine");
      res.set("X-Powered-By", "Wazubi");
      res.send(profileDOM.serialize());
    }
  } else {
    // not logged in - no session and no access, redirect to home!
    res.redirect("/");
  }
});

app.get("/payment", function (req, res) {
  if (req.session.loggedIn) {
    let doc = fs.readFileSync("./app/html/payment.html", "utf8");
    res.send(doc);
  } else {
    res.redirect("/");
  }
});

app.get("/cartHistory", function (req, res) {
  if (req.session.loggedIn) {
    let doc = fs.readFileSync("./app/html/cartHistory.html", "utf8");
    res.send(doc);
  } else {
    res.redirect("/");
  }
});

app.get("/contactus", (req, res) => {
  let doc = fs.readFileSync("./app/html/contactus.html", "utf8");
  res.send(doc);
});

app.get("/thanks", function (req, res) {
  if (req.session.loggedIn) {
    let doc = fs.readFileSync("./app/html/thankyou.html", "utf8");
    res.send(doc);
  } else {
    res.redirect("/");
  }
});

app.get("/about", function (req, res) {
  if (req.session.loggedIn) {
    let doc = fs.readFileSync("./app/html/aboutus.html", "utf8");
    res.send(doc);
  } else {
    res.redirect("/");
  }
});

app.post("/payment", function (req, res) {
  res.setHeader("Content-Type", "application/json");
  const mysql = require("mysql2");
  const connection = mysql.createConnection({
    // host: "127.0.0.1",
    // user: "root",
    // password: "",
    // multipleStatements: "true"
    host: 'us-cdbr-east-05.cleardb.net',
    user: 'b16ad059f5434a',
    password: '2255f096',
    database: 'heroku_02ad04623fadaa9'
  });
  connection.connect();

  let ccInfo = req.body;
  if (
    ccInfo.number.length != 16 ||
    ccInfo.expiry.length < 4 ||
    ccInfo.expiry.length > 4
  ) {
    res.send({ status: "fail", msg: "Invalid credit card details." });
  } else {
    res.send({ status: "success", msg: "Payment Approved" });
  }
});

app.post("/register", function (req, res) {
  res.setHeader("Content-Type", "application/json");
  const mysql = require("mysql2");
  const connection = mysql.createConnection({
    // host: "127.0.0.1",
    // user: "root",
    // password: "",
    // multipleStatements: "true"
    host: 'us-cdbr-east-05.cleardb.net',
    user: 'b16ad059f5434a',
    password: '2255f096',
    database: 'heroku_02ad04623fadaa9'
  });
  connection.connect();

  let validNewUserInfo = req.body;
  //Adds new user to user table. Always non admin, since this is client facing sign up
  connection.query(
    `use COMP2800; INSERT INTO BBY_25_users (user_name, first_name, last_name, email, password, is_admin, profile_pic) values (?, ?, ?, ?, ?, ?, ?)`,
    [
      validNewUserInfo.userName,
      validNewUserInfo.firstName,
      validNewUserInfo.lastName,
      validNewUserInfo.email,
      validNewUserInfo.password,
      false,
      "/img/luffy.png",
    ],
    function (error, results, fields) {
      if (error) {
        // send error to DB
      }
      //Saves information into session
      req.session.loggedIn = true;
      req.session.email = validNewUserInfo.email;
      req.session.name = validNewUserInfo.firstName;
      req.session.identity = validNewUserInfo.identity;
      req.session.userType = validNewUserInfo.is_admin;
      req.session.profilePic = "/img/luffy.png";
      req.session.save(function (err) {
        // session saved. for analytics we could record this in db
      });
      res.send({
        status: "success",
        msg: "Record added.",
      });
    }
  );
  connection.end();
});

app.post("/login", function (req, res) {
  res.setHeader("Content-Type", "application/json");
  const mysql = require("mysql2");
  const connection = mysql.createConnection({
    // host: "127.0.0.1",
    // user: "root",
    // password: "",
    // multipleStatements: "true"
    host: 'us-cdbr-east-05.cleardb.net',
    user: 'b16ad059f5434a',
    password: '2255f096',
    database: 'heroku_02ad04623fadaa9'
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
      res.send({
        status: "fail",
        msg: "Incorrect email or password",
      });
    } else {
      let validUserInfo = results[1][0];
      req.session.loggedIn = true;
      req.session.email = validUserInfo.email;
      req.session.name = validUserInfo.first_name;
      req.session.lastName = validUserInfo.last_name;
      req.session.password = validUserInfo.password;
      req.session.identity = validUserInfo.identity;
      req.session.userType = validUserInfo.is_admin;
      req.session.profilePic = validUserInfo.profile_pic;
      req.session.save(function (err) {
        // session saved. for analytics we could record this in db
      });
      res.send({
        status: "success",
        msg: "Logged in.",
      });
    }
  });
  connection.end();
});

//user cart page ***********************************************************************

app.get("/get-packages", function (req, res) {
  const connection = mysql.createConnection({
    // host: "127.0.0.1",
    // user: "root",
    // password: "",
    // multipleStatements: "true"
    host: 'us-cdbr-east-05.cleardb.net',
    user: 'b16ad059f5434a',
    password: '2255f096',
    database: 'heroku_02ad04623fadaa9'
  });
  connection.connect();
  connection.query(
    `SELECT * FROM BBY_25_USERS_PACKAGES WHERE userID = '${req.session.identity}';`,
    function (error, results, fields) {
      if (error) {
        // catch error and save to database
      } else {
        res.send({
          status: "success",
          rows: results,
        });
      }
    }
  );
  connection.end();
});

app.get("/get-donation", function (req, res) {
  const connection = mysql.createConnection({
    // host: "127.0.0.1",
    // user: "root",
    // password: "",
    // multipleStatements: "true"
    host: 'us-cdbr-east-05.cleardb.net',
    user: 'b16ad059f5434a',
    password: '2255f096',
    database: 'heroku_02ad04623fadaa9'
  });
  connection.connect();
  connection.query(
    `SELECT * FROM BBY_25_USERS_DONATION WHERE userID = '${req.session.identity}';`,
    function (error, results, fields) {
      if (error) {
        // catch error and save to database
      } else {
        res.send({
          status: "success",
          rows: results,
        });
      }
    }
  );
  connection.end();
});

// change purchased!!!
app.post("/update-purchased", function (req, res) {
  res.setHeader("Content-Type", "application/json");

  const connection = mysql.createConnection({
    // host: "127.0.0.1",
    // user: "root",
    // password: "",
    // multipleStatements: "true"
    host: 'us-cdbr-east-05.cleardb.net',
    user: 'b16ad059f5434a',
    password: '2255f096',
    database: 'heroku_02ad04623fadaa9'
  });
  connection.connect();

  connection.query(
    `UPDATE BBY_25_users_packages SET purchased = ? WHERE userID = '${req.session.identity}' ORDER BY postdate desc LIMIT 1;`,
    [req.body.purchased],
    function (error, results, fields) {
      if (error) {
        // catch error and save to database
      }

      res.send({
        status: "success",
        msg: "Recorded updated.",
      });
    }
  );
  connection.end();
});

// delete cart
app.get("/delete-cart", function (req, res) {
  res.setHeader("Content-Type", "application/json");

  const connection = mysql.createConnection({
    // host: "127.0.0.1",
    // user: "root",
    // password: "",
    // multipleStatements: "true"
    host: 'us-cdbr-east-05.cleardb.net',
    user: 'b16ad059f5434a',
    password: '2255f096',
    database: 'heroku_02ad04623fadaa9'
  });
  connection.connect();

  connection.query(
    "DELETE FROM bby_25_users_packages WHERE userID = ? order by postdate desc limit 1;",
    [req.session.identity],
    function (error, results, fields) {
      if (error) {
        res.send({
          status: "fail",
          msg: error,
        });
      } else {
        res.send({
          status: "success",
          msg: "Record deleted.",
        });
      }
    }
  );

  connection.end();
});

//*****************************************************************************************

//admin users edit-------------------------------------------------------------------------
app.get("/get-allUsers", function (req, res) {
  const connection = mysql.createConnection({
    // host: "127.0.0.1",
    // user: "root",
    // password: "",
    // multipleStatements: "true"
    host: 'us-cdbr-east-05.cleardb.net',
    user: 'b16ad059f5434a',
    password: '2255f096',
    database: 'heroku_02ad04623fadaa9'
  });
  connection.connect();
  connection.query(
    "select * from bby_25_users;",
    function (error, results, fields) {
      if (error) {
        // catch error and save to database
      }
      res.send({
        status: "success",
        rows: results,
      });
    }
  );
  connection.end();
});

// admin change emails!!!
app.post("/admin-update-email", function (req, res) {
  res.setHeader("Content-Type", "application/json");

  const connection = mysql.createConnection({
    // host: "127.0.0.1",
    // user: "root",
    // password: "",
    // multipleStatements: "true"
    host: 'us-cdbr-east-05.cleardb.net',
    user: 'b16ad059f5434a',
    password: '2255f096',
    database: 'heroku_02ad04623fadaa9'
  });
  connection.connect();
  connection.query(
    "UPDATE BBY_25_users SET email = ? WHERE identity = ?",
    [req.body.email, req.body.id],
    function (error, results, fields) {
      if (error) {
      }
      res.send({ status: "success", msg: "Recorded updated." });
    }
  );
  connection.end();
});

// admin change username!!!
app.post("/admin-update-username", function (req, res) {
  res.setHeader("Content-Type", "application/json");

  const connection = mysql.createConnection({
    // host: "127.0.0.1",
    // user: "root",
    // password: "",
    // multipleStatements: "true"
    host: 'us-cdbr-east-05.cleardb.net',
    user: 'b16ad059f5434a',
    password: '2255f096',
    database: 'heroku_02ad04623fadaa9'
  });
  connection.connect();

  connection.query(
    "UPDATE BBY_25_users SET user_name = ? WHERE identity = ?",
    [req.body.userName, req.body.id],
    function (error, results, fields) {
      if (error) {
        // catch error and save to database
      }

      res.send({
        status: "success",
        msg: "Recorded updated.",
      });
    }
  );
  connection.end();
});

// admin change first name!!!
app.post("/admin-update-firstname", function (req, res) {
  res.setHeader("Content-Type", "application/json");

  const connection = mysql.createConnection({
    // host: "127.0.0.1",
    // user: "root",
    // password: "",
    // multipleStatements: "true"
    host: 'us-cdbr-east-05.cleardb.net',
    user: 'b16ad059f5434a',
    password: '2255f096',
    database: 'heroku_02ad04623fadaa9'
  });
  connection.connect();

  connection.query(
    "UPDATE BBY_25_users SET first_name = ? WHERE identity = ?",
    [req.body.firstName, req.body.id],
    function (error, results, fields) {
      if (error) {
        // catch error and save to database
      }

      res.send({
        status: "success",
        msg: "Recorded updated.",
      });
    }
  );
  connection.end();
});

// admin change last name!!!
app.post("/admin-update-lastname", function (req, res) {
  res.setHeader("Content-Type", "application/json");

  const connection = mysql.createConnection({
    // host: "127.0.0.1",
    // user: "root",
    // password: "",
    // multipleStatements: "true"
    host: 'us-cdbr-east-05.cleardb.net',
    user: 'b16ad059f5434a',
    password: '2255f096',
    database: 'heroku_02ad04623fadaa9'
  });
  connection.connect();

  connection.query(
    "UPDATE BBY_25_users SET last_name = ? WHERE identity = ?",
    [req.body.lastName, req.body.id],
    function (error, results, fields) {
      if (error) {
        // catch error and save to database
      }

      res.send({
        status: "success",
        msg: "Recorded updated.",
      });
    }
  );
  connection.end();
});

// admin change password!!!
app.post("/admin-update-password", function (req, res) {
  res.setHeader("Content-Type", "application/json");

  const connection = mysql.createConnection({
    // host: "127.0.0.1",
    // user: "root",
    // password: "",
    // multipleStatements: "true"
    host: 'us-cdbr-east-05.cleardb.net',
    user: 'b16ad059f5434a',
    password: '2255f096',
    database: 'heroku_02ad04623fadaa9'
  });
  connection.connect();

  connection.query(
    "UPDATE BBY_25_users SET password = ? WHERE identity = ?",
    [req.body.password, req.body.id],
    function (error, results, fields) {
      if (error) {
        // catch error and save to database
      }

      res.send({
        status: "success",
        msg: "Recorded updated.",
      });
    }
  );
  connection.end();
});

// admin change isAdmin!!!
app.post("/admin-update-isAdmin", function (req, res) {
  res.setHeader("Content-Type", "application/json");

  const connection = mysql.createConnection({
    // host: "127.0.0.1",
    // user: "root",
    // password: "",
    // multipleStatements: "true"
    host: 'us-cdbr-east-05.cleardb.net',
    user: 'b16ad059f5434a',
    password: '2255f096',
    database: 'heroku_02ad04623fadaa9'
  });
  connection.connect();

  // if (req.body.isAdmin != 1 || req.body.isAdmin != 0){
  //     req.body.isAdmin = 0;
  // }

  connection.query(
    "UPDATE BBY_25_users SET is_admin = ? WHERE identity = ?",
    [req.body.isAdmin, req.body.id],
    function (error, results, fields) {
      if (error) {
        // catch error and save to database
      }

      res.send({
        status: "success",
        msg: "Recorded updated.",
      });
    }
  );
  connection.end();
});

app.post("/add-user", function (req, res) {
  res.setHeader("Content-Type", "application/json");

  const connection = mysql.createConnection({
    // host: "127.0.0.1",
    // user: "root",
    // password: "",
    // multipleStatements: "true"
    host: 'us-cdbr-east-05.cleardb.net',
    user: 'b16ad059f5434a',
    password: '2255f096',
    database: 'heroku_02ad04623fadaa9'
  });
  connection.connect();
  // TO PREVENT SQL INJECTION, DO THIS:
  // (FROM https://www.npmjs.com/package/mysql#escaping-query-values)
  connection.query(
    `INSERT INTO BBY_25_users (user_name, first_name, last_name, email, password, is_admin, profile_pic) values (?, ?, ?, ?, ?, ?, ?)`,
    [
      req.body.userName,
      req.body.firstName,
      req.body.lastName,
      req.body.email,
      req.body.password,
      req.body.isAdmin,
      "/img/luffy.png",
    ],
    function (error, results, fields) {
      if (error) {
        // catch error and save to database
      }

      res.send({
        status: "success",
        msg: "Record added.",
      });
    }
  );
  connection.end();
});

// POST: we are changing stuff on the server!!!
app.post("/delete-user", function (req, res) {
  res.setHeader("Content-Type", "application/json");

  const connection = mysql.createConnection({
    // host: "127.0.0.1",
    // user: "root",
    // password: "",
    // multipleStatements: "true"
    host: 'us-cdbr-east-05.cleardb.net',
    user: 'b16ad059f5434a',
    password: '2255f096',
    database: 'heroku_02ad04623fadaa9'
  });
  connection.connect();

  if (req.body.idNumber != req.session.identity) {
    connection.query(
      "DELETE FROM bby_25_users WHERE identity = ?",
      [req.body.idNumber],
      function (error, results, fields) {
        if (error) {
          // catch error and save to database
        }
        res.send({
          status: "success",
          msg: "Record deleted.",
        });
      }
    );
  } else {
    res.send({
      status: "fail",
      msg: "Not a valid input.",
    });
  }
  connection.end();
});

//-----------------------------------------------------------------------------------------

// regular users edit //////////////////////////////////////////////////////////////////////////////
//get the account page
app.get("/account", function (req, res) {
  let profile = fs.readFileSync("./app/html/account.html", "utf8");
  let profileDOM = new JSDOM(profile);

  profileDOM.window.document.getElementById("first_name").innerHTML =
    req.session.name;
  profileDOM.window.document.getElementById("last_name").innerHTML =
    req.session.lastName;
  profileDOM.window.document.getElementById("email").innerHTML =
    req.session.email;
  profileDOM.window.document.getElementById("password").innerHTML =
    req.session.password;
  profileDOM.window.document.getElementById("id").innerHTML =
    req.session.identity;

  res.set("Server", "Wazubi Engine");
  res.set("X-Powered-By", "Wazubi");
  res.send(profileDOM.serialize());
});

// updating first name!!!
app.post("/update-firstName", async function (req, res) {
  res.setHeader("Content-Type", "application/json");

  const connection = mysql.createConnection({
    // host: "127.0.0.1",
    // user: "root",
    // password: "",
    // multipleStatements: "true"
    host: 'us-cdbr-east-05.cleardb.net',
    user: 'b16ad059f5434a',
    password: '2255f096',
    database: 'heroku_02ad04623fadaa9'
  });
  connection.connect();
  connection.query(
    "UPDATE BBY_25_users SET first_name = ? WHERE identity = ?",
    [req.body.name, req.body.id],
    function (error, results, fields) {
      if (error) {
      }
      res.send({
        status: "success",
        msg: "Recorded updated.",
      });

      req.session.name = req.body.name;

      req.session.save(function (err) {
        // session saved. for analytics we could record this in db
      });
    }
  );
  connection.end();
});

// updating last name!!!
app.post("/update-lastName", async function (req, res) {
  res.setHeader("Content-Type", "application/json");

  const connection = mysql.createConnection({
    // host: "127.0.0.1",
    // user: "root",
    // password: "",
    // multipleStatements: "true"
    host: 'us-cdbr-east-05.cleardb.net',
    user: 'b16ad059f5434a',
    password: '2255f096',
    database: 'heroku_02ad04623fadaa9'
  });
  connection.connect();

  connection.query(
    "UPDATE BBY_25_users SET last_name = ? WHERE identity = ?",
    [req.body.lastName, req.body.id],
    function (error, results, fields) {
      if (error) {
        // catch error and save to database
      }

      res.send({
        status: "success",
        msg: "Recorded updated.",
      });

      req.session.lastName = req.body.lastName;

      req.session.save(function (err) {
        // session saved. for analytics we could record this in db
      });
    }
  );
  connection.end();
});

// updating email!!!
app.post("/update-email", async function (req, res) {
  res.setHeader("Content-Type", "application/json");

  const connection = mysql.createConnection({
    // host: "127.0.0.1",
    // user: "root",
    // password: "",
    // multipleStatements: "true"
    host: 'us-cdbr-east-05.cleardb.net',
    user: 'b16ad059f5434a',
    password: '2255f096',
    database: 'heroku_02ad04623fadaa9'
  });
  connection.connect();

  connection.query(
    "UPDATE BBY_25_users SET email = ? WHERE identity = ?",
    [req.body.email, req.body.id],
    function (error, results, fields) {
      if (error) {
        // catch error and save to database
      }

      res.send({
        status: "success",
        msg: "Recorded updated.",
      });

      req.session.email = req.body.email;

      req.session.save(function (err) {
        // session saved. for analytics we could record this in db
      });
    }
  );
  connection.end();
});

// updating last name!!!
app.post("/update-lastName", async function (req, res) {
  res.setHeader("Content-Type", "application/json");

  const connection = mysql.createConnection({
    // host: "127.0.0.1",
    // user: "root",
    // password: "",
    // multipleStatements: "true"
    host: 'us-cdbr-east-05.cleardb.net',
    user: 'b16ad059f5434a',
    password: '2255f096',
    database: 'heroku_02ad04623fadaa9'
  });
  connection.connect();

  connection.query(
    "UPDATE BBY_25_users SET last_name = ? WHERE ID = ?",
    [req.body.lastName, req.body.id],
    function (error, results, fields) {
      if (error) {
        // catch error and save to database
      }

      res.send({ status: "success", msg: "Recorded updated." });

      req.session.lastName = req.body.lastName;

      req.session.save(function (err) {
        // session saved. for analytics we could record this in db
      });
    }
  );
  connection.end();
});

// updating email!!!
app.post("/update-email", async function (req, res) {});

// update password!!!
app.post("/update-password", function (req, res) {
  res.setHeader("Content-Type", "application/json");

  const connection = mysql.createConnection({
    // host: "127.0.0.1",
    // user: "root",
    // password: "",
    // multipleStatements: "true"
    host: 'us-cdbr-east-05.cleardb.net',
    user: 'b16ad059f5434a',
    password: '2255f096',
    database: 'heroku_02ad04623fadaa9'
  });
  connection.connect();

  connection.query(
    "UPDATE BBY_25_users SET password = ? WHERE identity = ?",
    [req.body.password, req.body.id],
    function (error, results, fields) {
      if (error) {
        // catch error and save to database
      }

      res.send({
        status: "success",
        msg: "Recorded updated.",
      });

      req.session.password = req.body.password;

      req.session.save(function (err) {
        // session saved. for analytics we could record this in db
      });
    }
  );
  connection.end();
});

// updating profile pic!!!
app.post("/update-profilePic", function (req, res) {
  res.setHeader("Content-Type", "application/json");

  const connection = mysql.createConnection({
    // host: "127.0.0.1",
    // user: "root",
    // password: "",
    // multipleStatements: "true"
    host: 'us-cdbr-east-05.cleardb.net',
    user: 'b16ad059f5434a',
    password: '2255f096',
    database: 'heroku_02ad04623fadaa9'
  });
  connection.connect();
  connection.query(
    "UPDATE BBY_25_users SET profile_pic = ? WHERE identity = ?",
    [req.body.profilePic, req.body.id],
    function (error, results, fields) {
      if (error) {
      }
      res.send({
        status: "success",
        msg: "Recorded updated.",
      });

      req.session.profilePic = req.body.profilePic;

      req.session.save(function (err) {
        // session saved. for analytics we could record this in db
      });
    }
  );
  connection.end();
});


//////////////////////////////////////////////////////////////////////////////////////

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


let port = 5000;
app.listen(process.env.PORT || port);
