"use strict";
const express = require("express");
const session = require("express-session");
var multer  = require('multer');
const app = express();
const fs = require("fs");
const {
  connect
} = require("http2");
const {
  JSDOM
} = require("jsdom");
const mysql = require("mysql2");
const { createPoolCluster } = require("mysql");

// static path mappings
app.use("/js", express.static("./public/js"));
app.use("/css", express.static("./public/css"));
app.use("/img", express.static("./public/img"));
app.use("/fonts", express.static("./public/fonts"));
app.use("/html", express.static("./public/html"));
app.use("/media", express.static("./public/media"));
// app.use(express.static(__dirname + '/public'));

const is_heroku = process.env.IS_HEROKU || false;

const dbConfigHeroku = {
  host: 'eyvqcfxf5reja3nv.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
  user: 'wx1mc7pu6mewf76i',
  password: 't95p9w64os2ia6gv',
  database: 'h4ngdmrfus1wjzhr',
  multipleStatements: "true"
}

const dbConfigLocal = {
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "comp2800",
    multipleStatements: "true"
}

let pool;
// if (is_heroku) {
  // const mysql = require("mysql2/promise");
  pool = mysql.createPool(dbConfigHeroku);
  // var promiseConnection = mysql.createPool(dbConfigHeroku).promise();
// } else {
//   pool = mysql.createPool(dbConfigHeroku);
// }



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

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/img')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
var upload = multer({ storage: storage })

let userImage = "";

app.post('/profile-upload-single', upload.single('profile-file'), function (req, res, next) {
  // req.file is the `profile-file` file
  // req.body will hold the text fields, if there were any
  userImage += req.file.originalname;
  let doc = fs.readFileSync("./app/html/packageStatus.html", "utf8");
  return res.send(doc);
});


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

app.get("/updatePackageStatus", function (req, res) {
  let doc = fs.readFileSync("./app/html/packageStatus.html", "utf8");
  res.send(doc);
});

app.get("/get-packageStatus", function (req, res) {
  // const connection = mysql.createPool({
  //   // host: "127.0.0.1",
  //   // user: "root",
  //   // password: "",
  //   // multipleStatements: "true"
  //   // cleardb -----------------------
  //   // host: 'us-cdbr-east-05.cleardb.net',
  //   // user: 'b16ad059f5434a',
  //   // password: '2255f096',
  //   // database: 'heroku_02ad04623fadaa9'
  //   // jaws ----------------------
  //   host: 'eyvqcfxf5reja3nv.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
  //   user: 'wx1mc7pu6mewf76i',
  //   password: 't95p9w64os2ia6gv',
  //   database: 'h4ngdmrfus1wjzhr'
  // });
  pool.query(
    "SELECT * FROM BBY_25_users_packages WHERE purchased = 1 AND isDelivered = 0;",
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
});

app.post("/update-packages", function (req, res) {
  res.setHeader("Content-Type", "application/json");


    // req.file is the `profile-file` file
  // req.body will hold the text fields, if there were any
  // console.log(JSON.stringify(req.file));
  // console.log(JSON.stringify(req.file.path));

  // req.body.img = "./img" + req.file.originalname;

  // const connection = mysql.createConnection({
  //   // host: "127.0.0.1",
  //   // user: "root",
  //   // password: "",
  //   // multipleStatements: "true"
  //   // cleardb -----------------------
  //   // host: 'us-cdbr-east-05.cleardb.net',
  //   // user: 'b16ad059f5434a',
  //   // password: '2255f096',
  //   // database: 'heroku_02ad04623fadaa9'
  //   // jaws ----------------------
  //   host: 'eyvqcfxf5reja3nv.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
  //   user: 'wx1mc7pu6mewf76i',
  //   password: 't95p9w64os2ia6gv',
  //   database: 'h4ngdmrfus1wjzhr'
  // });
  // connection.connect();

  pool.query(
    "UPDATE BBY_25_users_packages SET isDelivered = ?, img = ? WHERE packageID = ?",
    [req.body.isDelivered, req.body.img, req.body.packageID],
    function (error, results, fields) {
      if (error) {
        // catch error and save to database
      }

      res.send({
        status: "success",
        msg: "Recorded updated.",
      });

      req.session.save(function (err) {
        // session saved. for analytics we could record this in db
      });
    }
  );
  // connection.end();
});

app.post("/donate", function (req, res) {
  // const mysql = require("mysql2");
  // const connection = mysql.createPool({
  //   // host: "127.0.0.1",
  //   // user: "root",
  //   // password: "",
  //   // multipleStatements: "true"
  //   // cleardb -----------------------
  //   // host: 'us-cdbr-east-05.cleardb.net',
  //   // user: 'b16ad059f5434a',
  //   // password: '2255f096',
  //   // database: 'heroku_02ad04623fadaa9'
  //   // jaws ----------------------
  //   host: 'eyvqcfxf5reja3nv.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
  //   user: 'wx1mc7pu6mewf76i',
  //   password: 't95p9w64os2ia6gv',
  //   database: 'h4ngdmrfus1wjzhr'
  // });
  let amount = req.body.amount;
  if (amount < 0 || amount > 9999999.99 || amount === "") {
    res.send({
      status: "fail",
      msg: "Invalid amount entered!"
    });
  } else {
    let postedDate = getDateTime();
    // let postedDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
    pool.query(
      `INSERT INTO bby_25_users_donation (userID, postdate, amount) VALUES (?, ?, ?)`,
      [req.session.identity, postedDate, req.body.amount],
    );
    res.send({
      status: "success",
      msg: "Record added."
    });
  }
});

app.get("/get-catalogue", function (req, res) {
  // const mysql = require("mysql2");
  // const connection = mysql.createConnection({
  //   // host: "127.0.0.1",
  //   // user: "root",
  //   // password: "",
  //   // multipleStatements: "true"
  //   // cleardb -----------------------
  //   // host: 'us-cdbr-east-05.cleardb.net',
  //   // user: 'b16ad059f5434a',
  //   // password: '2255f096',
  //   // database: 'heroku_02ad04623fadaa9'
  //   // jaws ----------------------
  //   host: 'eyvqcfxf5reja3nv.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
  //   user: 'wx1mc7pu6mewf76i',
  //   password: 't95p9w64os2ia6gv',
  //   database: 'h4ngdmrfus1wjzhr'
  // });
  // connection.connect();

  pool.query(
    "select * from bby_25_catalogue;",
    function (error, results, fields) {
      if (error) {
        //catch error and save to database
      } else {
        res.send({
          status: "success",
          rows: results[1]
        });
      }
    }
  );
  // connection.end();
});

// for admin update package status ------------------------------------------------------------
app.get("/history", async (req, res) => {
  let doc = fs.readFileSync("./app/html/notification.html", "utf8");
  let docDOM = new JSDOM(doc);
  const mysql = require("mysql2/promise");
  const connection = await mysql.createConnection({
    // host: "127.0.0.1",
    // user: "root",
    // password: "",
    // multipleStatements: "true"
    // cleardb -----------------------
    // host: 'us-cdbr-east-05.cleardb.net',
    // user: 'b16ad059f5434a',
    // password: '2255f096',
    // database: 'heroku_02ad04623fadaa9'
    // jaws ----------------------
    host: 'eyvqcfxf5reja3nv.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
    user: 'wx1mc7pu6mewf76i',
    password: 't95p9w64os2ia6gv',
    database: 'h4ngdmrfus1wjzhr',
    multipleStatements: "true"
  });
  await connection.connect();
  let packageList = "";
  const [results] = await connection.query(
    'SELECT * FROM BBY_25_users_packages WHERE userID = ? AND purchased = 1 ORDER BY postdate desc;',
    [req.session.identity]
  );
  results.forEach((result) => {
    packageList += buildNotifCards(result);
  });
  docDOM.window.document.getElementById("miniContainer").innerHTML =
    packageList;
  res.set("Server", "Wazubi Engine");
  res.set("X-Powered-By", "Wazubi");
  res.send(docDOM.serialize());
  connection.end();
});

app.post("/add-item", async (req, res) => {
  const mysql = require("mysql2/promise");
  const connection = await mysql.createConnection({
    // host: "127.0.0.1",
    // user: "root",
    // password: "",
    // multipleStatements: "true"
    // cleardb -----------------------
    // host: 'us-cdbr-east-05.cleardb.net',
    // user: 'b16ad059f5434a',
    // password: '2255f096',
    // database: 'heroku_02ad04623fadaa9'
    // jaws ----------------------
    host: 'eyvqcfxf5reja3nv.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
    user: 'wx1mc7pu6mewf76i',
    password: 't95p9w64os2ia6gv',
    database: 'h4ngdmrfus1wjzhr',
    multipleStatements: "true"
  });
  await connection.connect();
  await connection.query('INSERT INTO BBY_25_PACKAGES_ITEMS (packageID, itemID, itemQuantity) VALUES (?, ?, ?)',
    [req.session.packageID, req.body.itemID, req.body.quantity])
    .then(res.send({ status: "success", msg: "Added new item" }))
  connection.end();
});

function buildNotifCards(result) {
  let card = fs.readFileSync("./app/html/packageCard.html");
  let cardDOM = new JSDOM(card);
  let html = "";
  cardDOM.window.document
    .getElementById("cards")
    .setAttribute("id", `${result.packageID}`);
  cardDOM.window.document
    .getElementById("packageID")
    .setAttribute("id", `ID${result.packageID}`);
  cardDOM.window.document
    .getElementById("postdate")
    .setAttribute("id", `postDateOf${result.packageID}`);
  cardDOM.window.document
    .getElementById("packageStatus")
    .setAttribute("id", `packageStatusOf${result.packageID}`);
  cardDOM.window.document
    .getElementById("img")
    .setAttribute("id", `imgOf${result.packageID}`);
  cardDOM.window.document.getElementById(`ID${result.packageID}`).innerHTML =
    "Package ID: " + result.packageID;
  cardDOM.window.document.getElementById(`postDateOf${result.packageID}`).innerHTML =
    result.postdate;
  cardDOM.window.document.getElementById(`packageStatusOf${result.packageID}`).innerHTML =
    result.isDelivered ? "Package has been delievered" : "Package is enroute";
  if (result.isDelivered) {
    cardDOM.window.document.getElementById(`packageStatusOf${result.packageID}`).style.color = "#008642";
    cardDOM.window.document.getElementById(`packageStatusOf${result.packageID}`).style.textShadow =
      "0 0 7px #93f693, 0 0 10px #93f693, 0 0 21px #93f693, 0 0 42px #93f693, 0 0 82px #93f693, 0 0 92px #93f693, 0 0 102px #93f693, 0 0 151px #93f693";
  } else {
    cardDOM.window.document.getElementById(`packageStatusOf${result.packageID}`).style.color = "#fb0066";
  }

  cardDOM.window.document.getElementById(`imgOf${result.packageID}`).src = `${result.img}`;
  html = cardDOM.serialize();
  return html;
}

app.get("/cart", async function (req, res) {
  if (req.session.loggedIn) {
    let doc = fs.readFileSync("./app/html/cart.html", "utf8");
    let docDOM = new JSDOM(doc);
    const mysql = require("mysql2/promise");
    const connection = await mysql.createConnection({
      // host: "127.0.0.1",
      // user: "root",
      // password: "",
      // multipleStatements: "true"
      // cleardb -----------------------
      // host: 'us-cdbr-east-05.cleardb.net',
      // user: 'b16ad059f5434a',
      // password: '2255f096',
      // database: 'heroku_02ad04623fadaa9'
      // jaws ----------------------
      host: 'eyvqcfxf5reja3nv.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
      user: 'wx1mc7pu6mewf76i',
      password: 't95p9w64os2ia6gv',
      database: 'h4ngdmrfus1wjzhr',
      multipleStatements: "true"
    });
    let cartItems = "";
    const [results] = await connection.query(
      'SELECT i.itemID, c.name, i.itemQuantity, c.price from BBY_25_packages_items i inner join bby_25_catalogue c on c.itemID = i.itemID WHERE i.packageID = ?',
      [req.session.packageID],
    );
    let cartTotal = 0;
    results.forEach((result) => {
      cartTotal += parseFloat(result.price) * parseFloat(result.itemQuantity);
      cartItems += buildItemCartCard(result);
    })
    // let contents = results[0]["contents"].split(",").sort();
    // for (let i = 0; i < contents.length; i++) {
    //   const answer = await connection.query(
    //     `SELECT * from BBY_25_catalogue WHERE itemID = "${contents[i]}";`
    //   );
    //   cartItems += buildItemCartCard(answer[0][0]);
    // }
    docDOM.window.document.getElementById("total").innerHTML = `Cart Total : $${Number(cartTotal).toFixed(2)}`;
    docDOM.window.document.getElementById("content").innerHTML = cartItems;
    res.set("Server", "Wazubi Engine");
    res.set("X-Powered-By", "Wazubi");
    res.send(docDOM.serialize());
    connection.end();
  } else {
    res.redirect("/");
    connection.end();
  }
});

function buildItemCartCard(result) {
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
  cardDOM.window.document.getElementById(`priceOfItem${result.itemID}`).innerHTML = `Single Price: $${result.price}`;
  cardDOM.window.document.getElementById("quantity").setAttribute("id", `quantityOf${result.itemID}`);
  cardDOM.window.document.getElementById(`quantityOf${result.itemID}`).innerHTML =
    `Quantity: ${result.itemQuantity}`;
  cardDOM.window.document.getElementById("itemTotal").setAttribute("id", `itemTotalOf${result.itemID}`);
  let itemTotal = Number(parseFloat(result.price) * parseFloat(result.itemQuantity)).toFixed(2);
  cardDOM.window.document.getElementById(`itemTotalOf${result.itemID}`).innerHTML = `Item Total: $${itemTotal}`;
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

app.post("/create-cart", async function (req, res) {
  const mysql = require("mysql2/promise");
  const connection = await mysql.createConnection({
    // host: "127.0.0.1",
    // user: "root",
    // password: "",
    // multipleStatements: "true"
    // cleardb -----------------------
    // host: 'us-cdbr-east-05.cleardb.net',
    // user: 'b16ad059f5434a',
    // password: '2255f096',
    // database: 'heroku_02ad04623fadaa9'
    // jaws ----------------------
    host: 'eyvqcfxf5reja3nv.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
    user: 'wx1mc7pu6mewf76i',
    password: 't95p9w64os2ia6gv',
    database: 'h4ngdmrfus1wjzhr'
  });
  await connection.connect();
  let postDate = getDateTime();
  await connection.query(
    'INSERT INTO BBY_25_users_packages (userID, postdate, purchased, isDelivered, img) VALUES (?, ?, 0, 0, "/img/noImage.png");',
    [req.session.identity, postDate]
  );
  const [result] = await connection.query(`select packageID from bby_25_users_packages order by postdate desc limit 1`);
  req.session.packageID = result[0].packageID;
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
  const connection = await mysql.createConnection({
    // host: "127.0.0.1",
    // user: "root",
    // password: "",
    // multipleStatements: "true"
    // cleardb -----------------------
    // host: 'us-cdbr-east-05.cleardb.net',
    // user: 'b16ad059f5434a',
    // password: '2255f096',
    // database: 'heroku_02ad04623fadaa9'
    // jaws ----------------------
    host: 'eyvqcfxf5reja3nv.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
    user: 'wx1mc7pu6mewf76i',
    password: 't95p9w64os2ia6gv',
    database: 'h4ngdmrfus1wjzhr'
  });
  await connection.connect();
  const [results] = await connection.query("SELECT * FROM BBY_25_catalogue");
  callback(results);
  connection.end();
}

app.get("/package", function (req, res) {
  let doc = fs.readFileSync("./app/html/catalogue.html", "utf8");
  let docDOM = new JSDOM(doc);
  getAllItems((results) => {
    docDOM.window.document.getElementById("content").innerHTML =
    buildInvetoryCards(results);
  }).then(() => {
    res.set("Server", "Wazubi Engine");
    res.set("X-Powered-By", "Wazubi");
    res.send(docDOM.serialize());
  });
});

function buildInvetoryCards(results) {
  //reads card.html template
  let card = fs.readFileSync("./app/html/cardAdd.html", "utf8");
  let html = "";
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
      cardDOM.window.document.getElementById("quantity").setAttribute("id", `quantityOf${result.itemID}`);
      cardDOM.window.document.getElementById("most_wanted").setAttribute("id", `mostWanted${result.itemID}`);
      cardDOM.window.document.getElementById(`mostWanted${result.itemID}`).innerHTML
      = (result.most_wanted ? "High Demand" : "");
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

app.get("/donatePayment", function (req, res) {
  if (req.session.loggedIn) {
    let doc = fs.readFileSync("./app/html/donatePayment.html", "utf8");
    res.send(doc);
  } else {
    res.redirect("/");
  }
});

app.get("/packagePayment", function (req, res) {
  if (req.session.loggedIn) {
    let doc = fs.readFileSync("./app/html/packagePayment.html", "utf8");
    res.send(doc);
  } else {
    res.redirect("/");
  }
});

app.get("/cartHistory", function (req, res) {
  if (req.session.loggedIn) {
    let doc = fs.readFileSync("./app/html/cartHistory.html", "utf8");
    let docDOM = new JSDOM(doc);
    docDOM.window.document.getElementById("userHistory").innerHTML = 
    `${req.session.name}'s History`;
    res.send(docDOM.serialize());
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

app.get("/faq", (req, res) => {
  let doc = fs.readFileSync("./app/html/FAQ.html", "utf8");
  res.send(doc);
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
  // const mysql = require("mysql2");
  // const connection = mysql.createConnection({
  //   // host: "127.0.0.1",
  //   // user: "root",
  //   // password: "",
  //   // multipleStatements: "true"
  //   // cleardb -----------------------
  //   // host: 'us-cdbr-east-05.cleardb.net',
  //   // user: 'b16ad059f5434a',
  //   // password: '2255f096',
  //   // database: 'heroku_02ad04623fadaa9'
  //   // jaws ----------------------
  //   host: 'eyvqcfxf5reja3nv.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
  //   user: 'wx1mc7pu6mewf76i',
  //   password: 't95p9w64os2ia6gv',
  //   database: 'h4ngdmrfus1wjzhr'
  // });
  // connection.connect();

  let ccInfo = req.body;
  if (
    ccInfo.number.length != 16 ||
    ccInfo.expiry.length < 4 ||
    ccInfo.expiry.length > 4
  ) {
    res.send({
      status: "fail",
      msg: "Invalid credit card details."
    });
  } else {
    res.send({
      status: "success",
      msg: "Payment Approved"
    });
  }
  // connection.end();
});

app.post("/register", function (req, res) {
  res.setHeader("Content-Type", "application/json");
  // const mysql = require("mysql2");
  // const connection = mysql.createConnection({
  //   // host: "127.0.0.1",
  //   // user: "root",
  //   // password: "",
  //   // multipleStatements: "true"
  //   // cleardb -----------------------
  //   // host: 'us-cdbr-east-05.cleardb.net',
  //   // user: 'b16ad059f5434a',
  //   // password: '2255f096',
  //   // database: 'heroku_02ad04623fadaa9'
  //   // jaws ----------------------
  //   host: 'eyvqcfxf5reja3nv.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
  //   user: 'wx1mc7pu6mewf76i',
  //   password: 't95p9w64os2ia6gv',
  //   database: 'h4ngdmrfus1wjzhr'
  // });
  // connection.connect();


  let validNewUserInfo = req.body;
  //Adds new user to user table. Always non admin, since this is client facing sign up
  pool.query(
    `INSERT INTO BBY_25_users (user_name, first_name, last_name, email, password, is_admin, profile_pic) values (?, ?, ?, ?, ?, ?, ?)`,
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
      res.send({
        status: "success",
        msg: "Record added.",
      });
    }
  );
  // connection.end();
});

app.post("/login", function (req, res) {
  res.setHeader("Content-Type", "application/json");
  // const mysql = require("mysql2");
  // const connection = mysql.createConnection({
  //   // host: "127.0.0.1",
  //   // user: "root",
  //   // password: "",
  //   // multipleStatements: "true"
  //   // cleardb -----------------------
  //   // host: 'us-cdbr-east-05.cleardb.net',
  //   // user: 'b16ad059f5434a',
  //   // password: '2255f096',
  //   // database: 'heroku_02ad04623fadaa9'
  //   // jaws ----------------------
  //   host: 'eyvqcfxf5reja3nv.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
  //   user: 'wx1mc7pu6mewf76i',
  //   password: 't95p9w64os2ia6gv',
  //   database: 'h4ngdmrfus1wjzhr'
  // });

  // connection.connect();
  // Checks if user typed in matching email and password
  // const loginInfo = `SELECT * FROM BBY_25_USERS WHERE email = '${req.body.email}' AND password = '${req.body.password}';`
  pool.query('SELECT * FROM bby_25_users where email = ? and password = ?', 
  [req.body.email, req.body.password], function (error, results, fields) {
    /* If there is an error, alert user of error
     *  If the length of results array is 0, then there was no matches in database
     *  If no error, then it is valid login and save info for session
     */

    if (error) {
      // change this to notify user of error
    // } else if (results[1].length == 0) {
    //   res.send({
    //     status: "fail",
    //     msg: "Incorrect email or password",
    //   });
    } else {
      // for localhost
      // let validUserInfo = results[1][0];
      // for heroku
      let validUserInfo = results[0];
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
  // connection.end();
});

//user cart page ***********************************************************************

app.get("/get-packages", function (req, res) {
  // const connection = mysql.createConnection({
  //   // host: "127.0.0.1",
  //   // user: "root",
  //   // password: "",
  //   // multipleStatements: "true"
  //   // cleardb -----------------------
  //   // host: 'us-cdbr-east-05.cleardb.net',
  //   // user: 'b16ad059f5434a',
  //   // password: '2255f096',
  //   // database: 'heroku_02ad04623fadaa9'
  //   // jaws ----------------------
  //   host: 'eyvqcfxf5reja3nv.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
  //   user: 'wx1mc7pu6mewf76i',
  //   password: 't95p9w64os2ia6gv',
  //   database: 'h4ngdmrfus1wjzhr'
  // });
  // connection.connect();
  pool.query(
    `SELECT packageID, postdate, purchased FROM BBY_25_USERS_PACKAGES WHERE userID = '${req.session.identity}';`,
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
  // connection.end();
});

app.get("/get-donation", function (req, res) {
  // const connection = mysql.createConnection({
  //   // host: "127.0.0.1",
  //   // user: "root",
  //   // password: "",
  //   // multipleStatements: "true"
  //   // cleardb -----------------------
  //   // host: 'us-cdbr-east-05.cleardb.net',
  //   // user: 'b16ad059f5434a',
  //   // password: '2255f096',
  //   // database: 'heroku_02ad04623fadaa9'
  //   // jaws ----------------------
  //   host: 'eyvqcfxf5reja3nv.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
  //   user: 'wx1mc7pu6mewf76i',
  //   password: 't95p9w64os2ia6gv',
  //   database: 'h4ngdmrfus1wjzhr'
  // });
  // connection.connect();
  pool.query(
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
  // connection.end();
});

// change purchased!!!
app.post("/update-purchased", function (req, res) {
  res.setHeader("Content-Type", "application/json");

  // const connection = mysql.createConnection({
  //   // host: "127.0.0.1",
  //   // user: "root",
  //   // password: "",
  //   // multipleStatements: "true"
  //   // cleardb -----------------------
  //   // host: 'us-cdbr-east-05.cleardb.net',
  //   // user: 'b16ad059f5434a',
  //   // password: '2255f096',
  //   // database: 'heroku_02ad04623fadaa9'
  //   // jaws ----------------------
  //   host: 'eyvqcfxf5reja3nv.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
  //   user: 'wx1mc7pu6mewf76i',
  //   password: 't95p9w64os2ia6gv',
  //   database: 'h4ngdmrfus1wjzhr'
  // });
  // connection.connect();

  pool.query(
    'UPDATE BBY_25_users_packages SET purchased = 1 WHERE userID = ? ORDER BY postdate desc LIMIT 1;',
    [req.session.identity],
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
  // connection.end();
});

// delete cart
app.get("/delete-cart", function (req, res) {
  res.setHeader("Content-Type", "application/json");

  // const connection = mysql.createPool({
  //   // host: "127.0.0.1",
  //   // user: "root",
  //   // password: "",
  //   // multipleStatements: "true"
  //   // cleardb -----------------------
  //   // host: 'us-cdbr-east-05.cleardb.net',
  //   // user: 'b16ad059f5434a',
  //   // password: '2255f096',
  //   // database: 'heroku_02ad04623fadaa9'
  //   // jaws ----------------------
  //   host: 'eyvqcfxf5reja3nv.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
  //   user: 'wx1mc7pu6mewf76i',
  //   password: 't95p9w64os2ia6gv',
  //   database: 'h4ngdmrfus1wjzhr'
  // });
  // connection.connect();

  pool.query(
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

  // connection.end();
});

//*****************************************************************************************

//admin users edit-------------------------------------------------------------------------
app.get("/get-allUsers", function (req, res) {
  // const connection = mysql.createConnection({
  //   // host: "127.0.0.1",
  //   // user: "root",
  //   // password: "",
  //   // multipleStatements: "true"
  //   // cleardb -----------------------
  //   // host: 'us-cdbr-east-05.cleardb.net',
  //   // user: 'b16ad059f5434a',
  //   // password: '2255f096',
  //   // database: 'heroku_02ad04623fadaa9'
  //   // jaws ----------------------
  //   host: 'eyvqcfxf5reja3nv.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
  //   user: 'wx1mc7pu6mewf76i',
  //   password: 't95p9w64os2ia6gv',
  //   database: 'h4ngdmrfus1wjzhr'
  // });
  // connection.connect();
  pool.query(
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
  // connection.end();
});

// admin change emails!!!
app.post("/admin-update-email", function (req, res) {
  res.setHeader("Content-Type", "application/json");

  // const connection = mysql.createConnection({
  //   // host: "127.0.0.1",
  //   // user: "root",
  //   // password: "",
  //   // multipleStatements: "true"
  //   // cleardb -----------------------
  //   // host: 'us-cdbr-east-05.cleardb.net',
  //   // user: 'b16ad059f5434a',
  //   // password: '2255f096',
  //   // database: 'heroku_02ad04623fadaa9'
  //   // jaws ----------------------
  //   host: 'eyvqcfxf5reja3nv.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
  //   user: 'wx1mc7pu6mewf76i',
  //   password: 't95p9w64os2ia6gv',
  //   database: 'h4ngdmrfus1wjzhr'
  // });
  // connection.connect();
  pool.query(
    "UPDATE BBY_25_users SET email = ? WHERE identity = ?",
    [req.body.email, req.body.id],
    function (error, results, fields) {
      if (error) {}
      res.send({
        status: "success",
        msg: "Recorded updated."
      });
    }
  );
  // connection.end();
});

// admin change username!!!
app.post("/admin-update-username", function (req, res) {
  res.setHeader("Content-Type", "application/json");

  // const connection = mysql.createConnection({
  //   // host: "127.0.0.1",
  //   // user: "root",
  //   // password: "",
  //   // multipleStatements: "true"
  //   // cleardb -----------------------
  //   // host: 'us-cdbr-east-05.cleardb.net',
  //   // user: 'b16ad059f5434a',
  //   // password: '2255f096',
  //   // database: 'heroku_02ad04623fadaa9'
  //   // jaws ----------------------
  //   host: 'eyvqcfxf5reja3nv.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
  //   user: 'wx1mc7pu6mewf76i',
  //   password: 't95p9w64os2ia6gv',
  //   database: 'h4ngdmrfus1wjzhr'
  // });
  // connection.connect();

  pool.query(
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
  // connection.end();
});

// admin change first name!!
app.post("/admin-update-firstname", function (req, res) {
  res.setHeader("Content-Type", "application/json");

  // const connection = mysql.createConnection({
  //   // host: "127.0.0.1",
  //   // user: "root",
  //   // password: "",
  //   // multipleStatements: "true"
  //   // cleardb -----------------------
  //   // host: 'us-cdbr-east-05.cleardb.net',
  //   // user: 'b16ad059f5434a',
  //   // password: '2255f096',
  //   // database: 'heroku_02ad04623fadaa9'
  //   // jaws ----------------------
  //   host: 'eyvqcfxf5reja3nv.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
  //   user: 'wx1mc7pu6mewf76i',
  //   password: 't95p9w64os2ia6gv',
  //   database: 'h4ngdmrfus1wjzhr'
  // });
  // connection.connect();

  pool.query(
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
  // connection.end();
});

// admin change last name!!!
app.post("/admin-update-lastname", function (req, res) {
  res.setHeader("Content-Type", "application/json");

  // const connection = mysql.createConnection({
  //   // host: "127.0.0.1",
  //   // user: "root",
  //   // password: "",
  //   // multipleStatements: "true"
  //   // cleardb -----------------------
  //   // host: 'us-cdbr-east-05.cleardb.net',
  //   // user: 'b16ad059f5434a',
  //   // password: '2255f096',
  //   // database: 'heroku_02ad04623fadaa9'
  //   // jaws ----------------------
  //   host: 'eyvqcfxf5reja3nv.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
  //   user: 'wx1mc7pu6mewf76i',
  //   password: 't95p9w64os2ia6gv',
  //   database: 'h4ngdmrfus1wjzhr'
  // });
  // connection.connect();

  pool.query(
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
  // connection.end();
});

// admin change password!!!
app.post("/admin-update-password", function (req, res) {
  res.setHeader("Content-Type", "application/json");

  // const connection = mysql.createConnection({
  //   // host: "127.0.0.1",
  //   // user: "root",
  //   // password: "",
  //   // multipleStatements: "true"
  //   // cleardb -----------------------
  //   // host: 'us-cdbr-east-05.cleardb.net',
  //   // user: 'b16ad059f5434a',
  //   // password: '2255f096',
  //   // database: 'heroku_02ad04623fadaa9'
  //   // jaws ----------------------
  //   host: 'eyvqcfxf5reja3nv.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
  //   user: 'wx1mc7pu6mewf76i',
  //   password: 't95p9w64os2ia6gv',
  //   database: 'h4ngdmrfus1wjzhr'
  // });
  // connection.connect();

  pool.query(
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
  // connection.end();
});

// admin change isAdmin!!!
app.post("/admin-update-isAdmin", function (req, res) {
  res.setHeader("Content-Type", "application/json");

  // const connection = mysql.createConnection({
  //   // host: "127.0.0.1",
  //   // user: "root",
  //   // password: "",
  //   // multipleStatements: "true"
  //   // cleardb -----------------------
  //   // host: 'us-cdbr-east-05.cleardb.net',
  //   // user: 'b16ad059f5434a',
  //   // password: '2255f096',
  //   // database: 'heroku_02ad04623fadaa9'
  //   // jaws ----------------------
  //   host: 'eyvqcfxf5reja3nv.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
  //   user: 'wx1mc7pu6mewf76i',
  //   password: 't95p9w64os2ia6gv',
  //   database: 'h4ngdmrfus1wjzhr'
  // });
  // connection.connect();

  // if (req.body.isAdmin != 1 || req.body.isAdmin != 0){
  //     req.body.isAdmin = 0;
  // }

  pool.query(
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
  // connection.end();
});

app.post("/add-user", function (req, res) {
  res.setHeader("Content-Type", "application/json");

  // const connection = mysql.createConnection({
  //   // host: "127.0.0.1",
  //   // user: "root",
  //   // password: "",
  //   // multipleStatements: "true"
  //   // cleardb -----------------------
  //   // host: 'us-cdbr-east-05.cleardb.net',
  //   // user: 'b16ad059f5434a',
  //   // password: '2255f096',
  //   // database: 'heroku_02ad04623fadaa9'
  //   // jaws ----------------------
  //   host: 'eyvqcfxf5reja3nv.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
  //   user: 'wx1mc7pu6mewf76i',
  //   password: 't95p9w64os2ia6gv',
  //   database: 'h4ngdmrfus1wjzhr'
  // });
  // connection.connect();
  // TO PREVENT SQL INJECTION, DO THIS:
  // (FROM https://www.npmjs.com/package/mysql#escaping-query-values)
  pool.query(
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
  // connection.end();
});

// POST: we are changing stuff on the server!!!
app.post("/delete-user", function (req, res) {
  res.setHeader("Content-Type", "application/json");

  // const connection = mysql.createConnection({
  //   // host: "127.0.0.1",
  //   // user: "root",
  //   // password: "",
  //   // multipleStatements: "true"
  //   // cleardb -----------------------
  //   // host: 'us-cdbr-east-05.cleardb.net',
  //   // user: 'b16ad059f5434a',
  //   // password: '2255f096',
  //   // database: 'heroku_02ad04623fadaa9'
  //   // jaws ----------------------
  //   host: 'eyvqcfxf5reja3nv.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
  //   user: 'wx1mc7pu6mewf76i',
  //   password: 't95p9w64os2ia6gv',
  //   database: 'h4ngdmrfus1wjzhr'
  // });
  // connection.connect();

  if (req.body.idNumber != req.session.identity) {
    pool.query(
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
  // connection.end();
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

  // const connection = mysql.createConnection({
  //   // host: "127.0.0.1",
  //   // user: "root",
  //   // password: "",
  //   // multipleStatements: "true"
  //   // cleardb -----------------------
  //   // host: 'us-cdbr-east-05.cleardb.net',
  //   // user: 'b16ad059f5434a',
  //   // password: '2255f096',
  //   // database: 'heroku_02ad04623fadaa9'
  //   // jaws ----------------------
  //   host: 'eyvqcfxf5reja3nv.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
  //   user: 'wx1mc7pu6mewf76i',
  //   password: 't95p9w64os2ia6gv',
  //   database: 'h4ngdmrfus1wjzhr'
  // });
  // connection.connect();
  pool.query(
    "UPDATE BBY_25_users SET first_name = ? WHERE identity = ?",
    [req.body.name, req.body.id],
    function (error, results, fields) {
      if (error) {}
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
  // connection.end();
});

// updating last name!!!
app.post("/update-lastName", async function (req, res) {
  res.setHeader("Content-Type", "application/json");

  // const connection = mysql.createConnection({
  //   // host: "127.0.0.1",
  //   // user: "root",
  //   // password: "",
  //   // multipleStatements: "true"
  //   // cleardb -----------------------
  //   // host: 'us-cdbr-east-05.cleardb.net',
  //   // user: 'b16ad059f5434a',
  //   // password: '2255f096',
  //   // database: 'heroku_02ad04623fadaa9'
  //   // jaws ----------------------
  //   host: 'eyvqcfxf5reja3nv.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
  //   user: 'wx1mc7pu6mewf76i',
  //   password: 't95p9w64os2ia6gv',
  //   database: 'h4ngdmrfus1wjzhr'
  // });
  // connection.connect();

  pool.query(
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
  // connection.end();
});

// updating email!!!
app.post("/update-email", async function (req, res) {
  res.setHeader("Content-Type", "application/json");

  // const connection = mysql.createConnection({
  //   // host: "127.0.0.1",
  //   // user: "root",
  //   // password: "",
  //   // multipleStatements: "true"
  //   // cleardb -----------------------
  //   // host: 'us-cdbr-east-05.cleardb.net',
  //   // user: 'b16ad059f5434a',
  //   // password: '2255f096',
  //   // database: 'heroku_02ad04623fadaa9'
  //   // jaws ----------------------
  //   host: 'eyvqcfxf5reja3nv.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
  //   user: 'wx1mc7pu6mewf76i',
  //   password: 't95p9w64os2ia6gv',
  //   database: 'h4ngdmrfus1wjzhr'
  // });
  // connection.connect();

  pool.query(
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
  // connection.end();
});

// updating last name!!!
app.post("/update-lastName", async function (req, res) {
  res.setHeader("Content-Type", "application/json");

  // const connection = mysql.createConnection({
  //   // host: "127.0.0.1",
  //   // user: "root",
  //   // password: "",
  //   // multipleStatements: "true"
  //   // cleardb -----------------------
  //   // host: 'us-cdbr-east-05.cleardb.net',
  //   // user: 'b16ad059f5434a',
  //   // password: '2255f096',
  //   // database: 'heroku_02ad04623fadaa9'
  //   // jaws ----------------------
  //   host: 'eyvqcfxf5reja3nv.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
  //   user: 'wx1mc7pu6mewf76i',
  //   password: 't95p9w64os2ia6gv',
  //   database: 'h4ngdmrfus1wjzhr'
  // });
  // connection.connect();

  pool.query(
    "UPDATE BBY_25_users SET last_name = ? WHERE ID = ?",
    [req.body.lastName, req.body.id],
    function (error, results, fields) {
      if (error) {
        // catch error and save to database
      }

      res.send({
        status: "success",
        msg: "Recorded updated."
      });

      req.session.lastName = req.body.lastName;

      req.session.save(function (err) {
        // session saved. for analytics we could record this in db
      });
    }
  );
  // connection.end();
});

// updating email!!!
app.post("/update-email", async function (req, res) {});

// update password!!!
app.post("/update-password", function (req, res) {
  res.setHeader("Content-Type", "application/json");

  // const connection = mysql.createConnection({
  //   // host: "127.0.0.1",
  //   // user: "root",
  //   // password: "",
  //   // multipleStatements: "true"
  //   // cleardb -----------------------
  //   // host: 'us-cdbr-east-05.cleardb.net',
  //   // user: 'b16ad059f5434a',
  //   // password: '2255f096',
  //   // database: 'heroku_02ad04623fadaa9'
  //   // jaws ----------------------
  //   host: 'eyvqcfxf5reja3nv.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
  //   user: 'wx1mc7pu6mewf76i',
  //   password: 't95p9w64os2ia6gv',
  //   database: 'h4ngdmrfus1wjzhr'
  // });
  // connection.connect();

  pool.query(
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
  // connection.end();
});

// updating profile pic!!!
app.post("/update-profilePic", function (req, res) {
  res.setHeader("Content-Type", "application/json");

  // const connection = mysql.createConnection({
  //   // host: "127.0.0.1",
  //   // user: "root",
  //   // password: "",
  //   // multipleStatements: "true"
  //   // cleardb -----------------------
  //   // host: 'us-cdbr-east-05.cleardb.net',
  //   // user: 'b16ad059f5434a',
  //   // password: '2255f096',
  //   // database: 'heroku_02ad04623fadaa9'
  //   // jaws ----------------------
  //   host: 'eyvqcfxf5reja3nv.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
  //   user: 'wx1mc7pu6mewf76i',
  //   password: 't95p9w64os2ia6gv',
  //   database: 'h4ngdmrfus1wjzhr'
  // });
  // connection.connect();
  pool.query(
    "UPDATE BBY_25_users SET profile_pic = ? WHERE identity = ?",
    [req.body.profilePic, req.body.id],
    function (error, results, fields) {
      if (error) {}
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
  // connection.end();
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
