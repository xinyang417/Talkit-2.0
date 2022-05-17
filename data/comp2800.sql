CREATE DATABASE IF NOT EXISTS COMP2800;
use COMP2800;


CREATE TABLE IF NOT EXISTS BBY_01_user (
        ID int NOT NULL AUTO_INCREMENT,
        username varchar(30),
        email varchar(30),
        password varchar(20),
        isAdmin int,
        UNIQUE (email),
        PRIMARY KEY (ID));

-- Dummy user credentials data
INSERT INTO BBY_01_user (username, email, password, isAdmin) VALUES 
('Jason', 'jason@gmail.com', 'jason123', 1),
('Richard', 'richard@gmail.com', 'richard', 0),
('Chi Lan', 'chilan@gmail.com', 'chilan123', 1),
('Xinyang', 'xinyang@gmail.com', 'xinyang123', 0);

CREATE TABLE IF NOT EXISTS profile (
        profileID int NOT NULL AUTO_INCREMENT,
        userID int NOT NULL,
        displayName varchar(30),
        about varchar(500),
        profilePic varchar(500),
        PRIMARY KEY (profileID),
        FOREIGN KEY (userID) REFERENCES bby_01_user(ID)
        ON DELETE CASCADE
        ON UPDATE CASCADE);

-- Unused table for now
CREATE TABLE IF NOT EXISTS BBY_01_timeline (
        postID int NOT NULL AUTO_INCREMENT,
        userID int NOT NULL,
        title varchar(500),
        story varchar(2000),
        date datetime,
        PRIMARY KEY (postID),
        FOREIGN KEY (userID) REFERENCES bby_01_user(ID)
        ON DELETE CASCADE
        ON UPDATE CASCADE);
       

CREATE TABLE IF NOT EXISTS BBY_01_comment (
        commentID int NOT NULL AUTO_INCREMENT,
        postID int NOT NULL,
        userID int NOT NULL,
        comment varchar(2000),
        date datetime,
        PRIMARY KEY (commentID),
        FOREIGN KEY (postID) REFERENCES bby_01_timeline(postID)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
        FOREIGN KEY (userID) REFERENCES bby_01_user(ID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

insert into bby_01_timeline  (userID, title, story, date) values 
(1, 'MyStory', 'Hello World', 2020-02-02), 
(1, 'MyStory2', 'Hello World2!', 2020-05-02);

