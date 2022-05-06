CREATE DATABASE IF NOT EXISTS COMP2800;
use COMP2800;

CREATE TABLE IF NOT EXISTS BBY_25_users (
  ID int NOT NULL AUTO_INCREMENT,
  user_name varchar(30),
  first_name varchar(30),
  last_name varchar(30),
  email varchar(30),
  password varchar(30),
  is_admin BOOLEAN,
  PRIMARY KEY (ID));

CREATE TABLE IF NOT EXISTS BBY_25_users_packages (
  userID int NOT NULL,
  packageID int NOT NULL AUTO_INCREMENT,
  postdate DATE,
  posttext varchar(300),
  posttime TIME,
  PRIMARY KEY(packageID),
  CONSTRAINT fk_category
  FOREIGN KEY (userID)
    REFERENCES BBY_25_users(ID));

INSERT INTO BBY_25_users (user_name, first_name, last_name, email, password, is_admin) VALUES ("dbui", "Devon", "Bui", "dbui@bcit.ca", "test3", false);

INSERT INTO BBY_25_users (user_name, first_name, last_name, email, password, is_admin) VALUES ("damah", "David", "Amah", "damah@bcit.ca", "test4", false);

INSERT INTO BBY_25_users (user_name, first_name, last_name, email, password, is_admin) VALUES ("pdychinco", "Princeton", "Dychinco", "pdychinco@bcit.ca", "test1", true);

INSERT INTO BBY_25_users (user_name, first_name, last_name, email, password, is_admin) VALUES ("idatayan", "Izabelle", "Datayan", "idatayan@bcit.ca", "test2", true);