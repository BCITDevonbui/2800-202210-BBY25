'use strict';
const express = require("express");
const session = require("express-session");
const app = express();
const fs = require("fs");
const {
  connect
} = require("http2");
const {
  JSDOM
} = require('jsdom');
const mysql = require('mysql2');

// static path mappings
app.use("/js", express.static("./public/js"));
app.use("/css", express.static("./public/css"));
app.use("/img", express.static("./public/img"));
app.use("/fonts", express.static("./public/fonts"));
app.use("/html", express.static("./public/html"));
app.use("/media", express.static("./public/media"));


//session connection
app.use(session({
  secret: "extra text that no one will guess",
  name: "wazaSessionID",
  resave: false,
  // create a unique identifier for that client
  saveUninitialized: true
}));

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));



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
  res.send(doc)
});

app.get("/donate", function (req,res) {
  if(req.session.loggedIn) {
    let doc = fs.readFileSync("./app/html/donate.html","utf8");
    res.send(doc)
  } else {
    res.redirect("/");
  }
});

app.post("/donate", function(req,res) {
  res.setHeader("Content-Type", "application/json");
  const mysql = require("mysql2");
  const connection = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "",
    multipleStatements: "true"
  });
  connection.connect();

  let amount = req.body.amount;
  if(amount < 0 || amount > 9999999.99 || amount === "") {
    res.send({status: "fail", msg: "Invalid amount entered!"});
  } else {
    let date = new Date();
    let splitDate = String(date).split(" ");
    
    let month = 0;
    if(date.getMonth() + 1 < 9) {
      month = `0${date.getMonth() +1}`;
    }else {
      month = `${date.getMonth()+1}`;
    }
    console.log(splitDate[3], month, splitDate[2], splitDate[4]);
    let postedDate = `${splitDate[3]}-${month}-${splitDate[2]} ${splitDate[4]}`
    connection.query(`use COMP2800; INSERT INTO BBY_25_users_donation (userID, postdate, amount) VALUES (?, ?, ?)`, [req.session.identity, postedDate, amount]);
    res.send({status: "success", msg: "Record added."});
    connection.end();
  }
});

app.get("/profile", function (req, res) {
  // Check if user properly authenticated and logged in
  if (req.session.loggedIn) {
    //if admin user
    if (req.session.userType) {
      let profile = fs.readFileSync("./app/html/adminProfile.html", "utf8");
      let profileDOM = new JSDOM(profile);

      profileDOM.window.document.getElementById("profile_name").innerHTML = "Welcome back " + req.session.name;
      profileDOM.window.document.getElementById("profilePicture").src = req.session.profilePic;

      profileDOM.window.document.getElementById("profile_name").innerHTML
          = "Welcome back " + req.session.name;
      profileDOM.window.document.getElementById("profilePicture").src = req.session.profilePic;


      res.set("Server", "Wazubi Engine");
      res.set("X-Powered-By", "Wazubi");
      res.send(profileDOM.serialize());
    } else {
      //if a normal user
      let profile = fs.readFileSync("./app/html/profile.html", "utf8");
      let profileDOM = new JSDOM(profile);
  
      profileDOM.window.document.getElementById("profile_name").innerHTML
          = "Welcome back " + req.session.name;
      profileDOM.window.document.getElementById("profilePicture").src = req.session.profilePic;
  
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
  if(req.session.loggedIn) {
    let doc = fs.readFileSync("./app/html/payment.html", "utf8");
    res.send(doc);
  } else {
    res.redirect("/");
  }
});

<<<<<<< HEAD
=======
app.get("/payment", function (req, res) {
  if(req.session.loggedIn) {
    let doc = fs.readFileSync("./app/html/payment.html", "utf8");
    res.send(doc);
  } else {
    res.redirect("/");
  }
});

>>>>>>> princeton_dychinco_donate
app.get("/thanks", function (req, res) {
  if (req.session.loggedIn) {
    let doc = fs.readFileSync("./app/html/thankyou.html", "utf8");
    res.send(doc);
  } else {
    res.redirect("/");
  }
})

app.post("/payment", function (req,res) {
  res.setHeader("Content-Type", "application/json");
  const mysql = require("mysql2");
  const connection = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "",
    multipleStatements: "true"
  });
  connection.connect();

  let ccInfo = req.body;
  if(ccInfo.number.length != 16 || ccInfo.expiry.length < 4 || ccInfo.expiry.length > 4) {
    res.send({ status: "fail", msg: "Invalid credit card details."});
  } else {
    res.send({ status: "success", msg: "Payment Approved"});
  }
})

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
      req.session.identity = validNewUserInfo.identity;
      req.session.userType = validNewUserInfo.is_admin;
      req.session.save(function (err) {
        // session saved. for analytics we could record this in db
      })
      res.send({
        status: "success",
        msg: "Record added."
      });

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
<<<<<<< HEAD

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
        msg: "Incorrect email or password"
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
      })
      res.send({
        status: "success",
        msg: "Logged in."
      });
    }
  })
  connection.end();
});


//admin users edit-------------------------------------------------------------------------
app.get('/get-allUsers', function (req, res) {

  let connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'comp2800'
  });
  connection.connect();
  connection.query('select * from bby_25_users;', function (error, results, fields) {
    if (error) {
      console.log(error);
    }
    console.log('Rows returned are: ', results);
    res.send({
      status: "success",
      rows: results
    });

  });
  connection.end();


});

// admin change emails!!!
app.post('/admin-update-email', function (req, res) {
  res.setHeader('Content-Type', 'application/json');

  let connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'comp2800'
  });
  connection.connect();
  console.log("update values", req.body.email, req.body.id)
  connection.query('UPDATE BBY_25_users SET email = ? WHERE identity = ?',
    [req.body.email, req.body.id],
    function (error, results, fields) {
      if (error) {
        console.log(error);
      }
      //console.log('Rows returned are: ', results);
      res.send({
        status: "success",
        msg: "Recorded updated."
      });

    });
  connection.end();

});

// admin change username!!!
app.post('/admin-update-username', function (req, res) {
  res.setHeader('Content-Type', 'application/json');

  let connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'comp2800'
  });
  connection.connect();
  console.log("update values", req.body.userName, req.body.id)
  connection.query('UPDATE BBY_25_users SET user_name = ? WHERE identity = ?',
    [req.body.userName, req.body.id],
    function (error, results, fields) {
      if (error) {
        console.log(error);
      }
      //console.log('Rows returned are: ', results);
      res.send({
        status: "success",
        msg: "Recorded updated."
      });

    });
  connection.end();

});

// admin change first name!!!
app.post('/admin-update-firstname', function (req, res) {
  res.setHeader('Content-Type', 'application/json');

  let connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'comp2800'
  });
  connection.connect();
  console.log("update values", req.body.firstName, req.body.id)
  connection.query('UPDATE BBY_25_users SET first_name = ? WHERE identity = ?',
    [req.body.firstName, req.body.id],
    function (error, results, fields) {
      if (error) {
        console.log(error);
      }
      //console.log('Rows returned are: ', results);
      res.send({
        status: "success",
        msg: "Recorded updated."
      });

    });
  connection.end();

});

// admin change last name!!!
app.post('/admin-update-lastname', function (req, res) {
  res.setHeader('Content-Type', 'application/json');

  let connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'comp2800'
  });
  connection.connect();
  console.log("update values", req.body.lastName, req.body.id)
  connection.query('UPDATE BBY_25_users SET last_name = ? WHERE identity = ?',
    [req.body.lastName, req.body.id],
    function (error, results, fields) {
      if (error) {
        console.log(error);
      }
      //console.log('Rows returned are: ', results);
      res.send({
        status: "success",
        msg: "Recorded updated."
      });

    });
  connection.end();

});

// admin change password!!!
app.post('/admin-update-password', function (req, res) {
  res.setHeader('Content-Type', 'application/json');

  let connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'comp2800'
  });
  connection.connect();
  console.log("update values", req.body.password, req.body.id)
  connection.query('UPDATE BBY_25_users SET password = ? WHERE identity = ?',
    [req.body.password, req.body.id],
    function (error, results, fields) {
      if (error) {
        console.log(error);
      }
      //console.log('Rows returned are: ', results);
      res.send({
        status: "success",
        msg: "Recorded updated."
      });

    });
  connection.end();

});

// admin change isAdmin!!!
app.post('/admin-update-isAdmin', function (req, res) {
  res.setHeader('Content-Type', 'application/json');

  let connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'comp2800'
  });
  connection.connect();

  // if (req.body.isAdmin != 1 || req.body.isAdmin != 0){
  //     req.body.isAdmin = 0;
  // }

  console.log("update values", req.body.isAdmin, req.body.id)

  connection.query('UPDATE BBY_25_users SET is_admin = ? WHERE identity = ?',
    [req.body.isAdmin, req.body.id],
    function (error, results, fields) {
      if (error) {
        console.log(error);
      }
      //console.log('Rows returned are: ', results);
      res.send({
        status: "success",
        msg: "Recorded updated."
      });

    });
  connection.end();

});

app.post('/add-user', function (req, res) {
  res.setHeader('Content-Type', 'application/json');

  console.log("userName", req.body.userName);
  console.log("firstName", req.body.firstName);
  console.log("lastName", req.body.lastName);
  console.log("Email", req.body.email);
  console.log("password", req.body.password);
  console.log("isAdmin", req.body.isAdmin);

  let connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'comp2800'
  });
  connection.connect();
  // TO PREVENT SQL INJECTION, DO THIS:
  // (FROM https://www.npmjs.com/package/mysql#escaping-query-values)
  connection.query(`INSERT INTO BBY_25_users (user_name, first_name, last_name, email, password, is_admin) values (?, ?, ?, ?, ?, ?)`,
    [req.body.userName, req.body.firstName, req.body.lastName, req.body.email, req.body.password, req.body.isAdmin],
    function (error, results, fields) {
      if (error) {
        console.log(error);
      }
      //console.log('Rows returned are: ', results);
      res.send({
        status: "success",
        msg: "Record added."
      });

    });
  connection.end();

});

// POST: we are changing stuff on the server!!!
app.post('/delete-user', function (req, res) {
  res.setHeader('Content-Type', 'application/json');

  let connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'comp2800'
  });
  connection.connect();

  console.log("idNumber" + req.body.idNumber);

  connection.query("DELETE FROM bby_25_users WHERE identity = ?",
    [req.body.idNumber],
    function (error, results, fields) {
      if (error) {
        console.log(error);
      }
      //console.log('Rows returned are: ', results);
      res.send({
        status: "success",
        msg: "Record deleted."
      });

    });
  connection.end();

});


//-----------------------------------------------------------------------------------------

// regular users edit //////////////////////////////////////////////////////////////////////////////
//get the account page
app.get('/account', function (req, res) {

  let profile = fs.readFileSync("./app/html/account.html", "utf8");
  let profileDOM = new JSDOM(profile);

  profileDOM.window.document.getElementById("first_name").innerHTML = req.session.name;
  profileDOM.window.document.getElementById("last_name").innerHTML = req.session.lastName;
  profileDOM.window.document.getElementById("email").innerHTML = req.session.email
  profileDOM.window.document.getElementById("password").innerHTML = req.session.password;
  profileDOM.window.document.getElementById("id").innerHTML = req.session.identity;

  res.set("Server", "Wazubi Engine");
  res.set("X-Powered-By", "Wazubi");
  res.send(profileDOM.serialize());

});

// updating first name!!!
app.post('/update-firstName', async function (req, res) {
  res.setHeader('Content-Type', 'application/json');

  let connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'comp2800'
  });
  connection.connect();
  console.log("update values", req.body.name, req.body.id)
  connection.query('UPDATE BBY_25_users SET first_name = ? WHERE identity = ?',
    [req.body.name, req.body.id],
    function (error, results, fields) {
      if (error) {
        console.log(error);
      }
      //console.log('Rows returned are: ', results);
      res.send({
        status: "success",
        msg: "Recorded updated."
      });

      req.session.name = req.body.name;
      console.log(req.session.name);

      req.session.save(function (err) {
        // session saved. for analytics we could record this in db
      })

    });
  connection.end();

});

// updating last name!!!
app.post('/update-lastName', async function (req, res) {
  res.setHeader('Content-Type', 'application/json');

  let connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'comp2800'
  });
  connection.connect();
  console.log("update values", req.body.lastName, req.body.id)
  connection.query('UPDATE BBY_25_users SET last_name = ? WHERE identity = ?',
    [req.body.lastName, req.body.id],
    function (error, results, fields) {
      if (error) {
        console.log(error);
      }
      //console.log('Rows returned are: ', results);
      res.send({
        status: "success",
        msg: "Recorded updated."
      });

      req.session.lastName = req.body.lastName;
      console.log(req.session.lastName);

      req.session.save(function (err) {
=======
    
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
      } else {
        let validUserInfo = results[1][0];
        req.session.loggedIn = true;
        req.session.email = validUserInfo.email;
        req.session.name = validUserInfo.first_name;
        req.session.identity = validUserInfo.identity;
        req.session.userType = validUserInfo.is_admin;
        req.session.save(function (err) {
>>>>>>> princeton_dychinco_donate
        // session saved. for analytics we could record this in db
      })

    });
  connection.end();

});

// updating email!!!
app.post('/update-email', async function (req, res) {
  res.setHeader('Content-Type', 'application/json');

  let connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'comp2800'
  });
  connection.connect();
  console.log("update values", req.body.email, req.body.id)
  connection.query('UPDATE BBY_25_users SET email = ? WHERE identity = ?',
    [req.body.email, req.body.id],
    function (error, results, fields) {
      if (error) {
        console.log(error);
      }
      //console.log('Rows returned are: ', results);
      res.send({
        status: "success",
        msg: "Recorded updated."
      });

      req.session.email = req.body.email;
      console.log(req.session.email);

      req.session.save(function (err) {
        // session saved. for analytics we could record this in db
      })

    });
  connection.end();

});

// updating last name!!!
app.post('/update-lastName', async function (req, res) {
  res.setHeader('Content-Type', 'application/json');

  let connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'comp2800'
  });
  connection.connect();
console.log("update values", req.body.lastName, req.body.id)
  connection.query('UPDATE BBY_25_users SET last_name = ? WHERE ID = ?',
        [req.body.lastName, req.body.id],
        function (error, results, fields) {
    if (error) {
        console.log(error);
    }
    //console.log('Rows returned are: ', results);
    res.send({ status: "success", msg: "Recorded updated." });

    req.session.lastName = req.body.lastName;
    console.log(req.session.lastName);

    req.session.save(function (err) {
      // session saved. for analytics we could record this in db
    })

  });
  connection.end();

});

// updating email!!!
app.post('/update-email', async function (req, res) {
});

// update password!!!
app.post('/update-password', function (req, res) {
  res.setHeader('Content-Type', 'application/json');

  let connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'comp2800'
  });
  connection.connect();
  console.log("update values", req.body.password, req.body.id)
  connection.query('UPDATE BBY_25_users SET password = ? WHERE identity = ?',
    [req.body.password, req.body.id],
    function (error, results, fields) {
      if (error) {
        console.log(error);
      }
      //console.log('Rows returned are: ', results);
      res.send({
        status: "success",
        msg: "Recorded updated."
      });

      req.session.password = req.body.password;
      console.log(req.session.password);

      req.session.save(function (err) {
        // session saved. for analytics we could record this in db
      })

    });
  connection.end();

});


// update password!!!
app.post('/update-password', function (req, res) {
});
// updating profile pic!!!
// update password!!!
app.post('/update-profilePic', function (req, res) {
  res.setHeader('Content-Type', 'application/json');

  let connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'comp2800'
  });
  connection.connect();
  console.log("update values", req.body.profilePic, req.body.id)
  connection.query('UPDATE BBY_25_users SET profile_pic = ? WHERE identity = ?',
    [req.body.profilePic, req.body.id],
    function (error, results, fields) {
      if (error) {
        console.log(error);
      }
      //console.log('Rows returned are: ', results);
      res.send({
        status: "success",
        msg: "Recorded updated."
      });

      req.session.profilePic = req.body.profilePic;
      console.log(req.session.profilePic);

      req.session.save(function (err) {
        // session saved. for analytics we could record this in db
      })

    });
  connection.end();

});

//////////////////////////////////////////////////////////////////////////////////////

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