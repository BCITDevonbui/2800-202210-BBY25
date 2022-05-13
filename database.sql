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
  profile_pic varchar(60),
  PRIMARY KEY (identity));

CREATE TABLE IF NOT EXISTS BBY_25_users_packages (
  userID int NOT NULL,
  packageID int NOT NULL AUTO_INCREMENT,
  postdate DATE,
  posttext varchar(300),
  posttime TIME,
  PRIMARY KEY(packageID),
  CONSTRAINT fk_category
  FOREIGN KEY (userID)
    REFERENCES BBY_25_users(identity));

CREATE TABLE IF NOT EXISTS BBY_25_users_donation (
  donateID int NOT NULL AUTO_INCREMENT,
  userID int NOT NULL,
  postdate DATETIME,
  amount DECIMAL(10,2) NOT NULL,
  PRIMARY KEY(donateID),
  FOREIGN KEY (userID)
    REFERENCES BBY_25_users(identity));

INSERT INTO BBY_25_users (user_name, first_name, last_name, email, password, is_admin, profile_pic) VALUES ("dbui", "Devon", "Bui", "dbui@bcit.ca", "test3", false, "/img/luffy.png");

INSERT INTO BBY_25_users (user_name, first_name, last_name, email, password, is_admin, profile_pic) VALUES ("damah", "David", "Amah", "damah@bcit.ca", "test4", false, "/img/luffy.png");

INSERT INTO BBY_25_users (user_name, first_name, last_name, email, password, is_admin, profile_pic) VALUES ("pdychinco", "Princeton", "Dychinco", "pdychinco@bcit.ca", "test1", true, "/img/luffy.png");

INSERT INTO BBY_25_users (user_name, first_name, last_name, email, password, is_admin, profile_pic) VALUES ("idatayan", "Izabelle", "Datayan", "idatayan@bcit.ca", "test2", true, "/img/luffy.png");
