CREATE DATABASE IF NOT EXISTS COMP2800;
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
  PRIMARY KEY(ID));