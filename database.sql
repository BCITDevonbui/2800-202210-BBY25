CREATE DATABASE IF NOT EXISTS COMP2800;
use COMP2800;

CREATE TABLE IF NOT EXISTS BBY_25_users (
  identity int NOT NULL AUTO_INCREMENT,
  user_name varchar(30),
  first_name varchar(30),
  last_name varchar(30),
  email varchar(30),
  password varchar(30),
  is_admin BOOLEAN,
  PRIMARY KEY (identity));

CREATE TABLE IF NOT EXISTS BBY_25_users_packages (
  userID int NOT NULL,
  packageID int NOT NULL AUTO_INCREMENT,
  postdate DATETIME,
  contents varchar(1000),
  PRIMARY KEY(packageID),
  CONSTRAINT fk_user
  FOREIGN KEY (userID)
    REFERENCES BBY_25_users(identity));

CREATE TABLE IF NOT EXISTS BBY_25_catalogue (
  itemID int NOT NULL AUTO_INCREMENT,
  name varchar(30) NOT NULL,
  quantity int NOT NULL, 
  price decimal(6, 2) NOT NULL,
  most_wanted boolean NOT NULL,
  PRIMARY KEY (itemID));

INSERT INTO BBY_25_users (user_name, first_name, last_name, email, password, is_admin) VALUES ("dbui", "Devon", "Bui", "dbui@bcit.ca", "test3", false);

INSERT INTO BBY_25_users (user_name, first_name, last_name, email, password, is_admin) VALUES ("damah", "David", "Amah", "damah@bcit.ca", "test4", false);

INSERT INTO BBY_25_users (user_name, first_name, last_name, email, password, is_admin) VALUES ("pdychinco", "Princeton", "Dychinco", "pdychinco@bcit.ca", "test1", true);

INSERT INTO BBY_25_users (user_name, first_name, last_name, email, password, is_admin) VALUES ("idatayan", "Izabelle", "Datayan", "idatayan@bcit.ca", "test2", true);

INSERT INTO BBY_25_catalogue (name, quantity, price, most_wanted) VALUES ("Toothbrush", 1000, 1.99, true);

INSERT INTO BBY_25_catalogue (name, quantity, price, most_wanted) VALUES ("Boots", 500, 19.99, true);

INSERT INTO BBY_25_catalogue (name, quantity, price, most_wanted) VALUES ("Sleeping Bag", 500, 24.99, true);

INSERT INTO BBY_25_catalogue (name, quantity, price, most_wanted) VALUES ("Baby Food", 500, 9.99, true);

INSERT INTO BBY_25_catalogue (name, quantity, price, most_wanted) VALUES ("Non-Perishable Food", 500, 29.99, true);

INSERT INTO BBY_25_catalogue (name, quantity, price, most_wanted) VALUES ("First-aid Kit", 500, 14.99, false);

INSERT INTO BBY_25_catalogue (name, quantity, price, most_wanted) VALUES ("Books", 500, 4.99, false);

INSERT INTO BBY_25_catalogue (name, quantity, price, most_wanted) VALUES ("Socks", 500, 2.99, false);

INSERT INTO BBY_25_catalogue (name, quantity, price, most_wanted) VALUES ("Cell Phone", 500, 199.99, false);
