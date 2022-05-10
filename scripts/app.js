"use strict";
const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');
const fs = require("fs");
const { JSDOM } = require('jsdom');
const path = require('path');
const { res } = require('express');
const multer = require("multer");
const app = express();


app.use("/img", express.static("../images"));
app.use("/css", express.static("../styles"));
app.use("/js", express.static('../js'));
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(express.static(path.join(__dirname, 'static')));

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "../images/")
    },
    filename: function (req, file, callback) {
        callback(null, "my-app-" + file.originalname.split('/').pop().trim());
    }
});

const upload = multer({
    storage: storage
});

app.post('/upload-images', upload.array("files"), (req, res) => {

    for (let i = 0; i < req.files.length; i++) {
        req.files[i].filename = req.files[i].originalname;
    }
});


app.get('/', (req, res) => {
    if (!req.session.loggedin) {
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        multipleStatements: true,
        database: 'talkit'
    });

    const sql = `CREATE DATABASE IF NOT EXISTS talkit;
        use talkit;
        CREATE TABLE IF NOT EXISTS BBY_01_user (
        ID int NOT NULL AUTO_INCREMENT,
        username varchar(30),
        email varchar(30),
        password varchar(20),
        isAdmin int,
        UNIQUE (email),
        PRIMARY KEY (ID));`;

    connection.connect();
    connection.query(sql, (error, results) => {
        if (error) console.log(error);
    });
    connection.end();
    let doc = fs.readFileSync('../login.html', "utf-8");
    res.send(doc);
} else {
    res.redirect('/home');
}
});

app.get('/signup', (req, res) => {
    let doc = fs.readFileSync('../signup.html', "utf-8");
    res.send(doc);
})


app.post('/auth', (req, res) => {

    // Connect to database
    let connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        multipleStatements: true,
        database: 'talkit'
    });
    // Capture the input fields
    let username = req.body.username;
    let password = req.body.password;
    // Ensure the input fields exists and are not empty
    if (username && password) {
        // Execute SQL query that'll select the account from the database based on the specified username and password
        connection.query('SELECT * FROM BBY_01_user WHERE username = ? AND password = ?', [username, password], function (error, results, fields) {
            
            // If there is an issue with the query, output the error
            if (error) throw error;
            // If the account exists
            if (results.length > 0) {
                // Authenticate the user
                req.session.loggedin = true;
                req.session.username = username;
                req.session.isAdmin = results[0].isAdmin;
                // Redirect to home page
                res.redirect('/home');

            } else {
                res.send('Incorrect Username and/or Password!');
            }
            res.end();
        });
    } else {
        res.send('Please enter Username and Password!');
        res.end();
    }
});

app.get('/home', (req, res) => {

    // If the user is logged in
    if (req.session.loggedin) {
        let profile = fs.readFileSync("../main.html", "utf8");
        let profileDOM = new JSDOM(profile);
        res.send(profileDOM.serialize());
    } else {
        // If the user is not logged in
        res.redirect("/");
    }
    
    res.end();
});

app.get('/admin', (req, res) => {
    console.log(req.session.isAdmin);
    // If the user is logged in
    if (req.session.loggedin && req.session.isAdmin > 0) {
        // Render login template
        let doc = fs.readFileSync('../users.html', "utf-8");
        res.send(doc);

        console.log(req.session.isAdmin);
    } else {
        // If the user is not logged in
        res.redirect("/home");
        
    }
    res.end();
});

app.get('/profile', (req, res) => {
    // If the user is logged in
    if (req.session.loggedin) {
        const connection = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            multipleStatements: true
        });

        const sql = `CREATE DATABASE IF NOT EXISTS talkit;
        use talkit;
        CREATE TABLE IF NOT EXISTS profile (
        profileID int NOT NULL AUTO_INCREMENT,
        userID int NOT NULL,
        displayName varchar(30),
        about varchar(500),
        PRIMARY KEY (profileID),
        FOREIGN KEY (userID) REFERENCES user(ID)
        ON DELETE CASCADE
        ON UPDATE CASCADE);`;
        connection.connect();
        connection.query(sql, (error, results, fields) => {
            if (error) {
                console.log(error);
            }
        });
        connection.end();

        let doc = fs.readFileSync('../profile.html', "utf8");
        res.send(doc);
    } else {
        // If the user is not logged in
        res.redirect("/");
    }
});

app.get('/update-profile', (req, res) => {
    // If the user is loggedin
    if (req.session.loggedin) {
        let doc = fs.readFileSync('../update-profile.html', "utf-8");
        res.send(doc);
    } else {
        // If the user is not logged in
        res.redirect("/");
    }
})

app.get('/get-displayname', (req, res) => {
    // If the user is loggedin
    if (req.session.loggedin) {
        const connection = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'talkit'
        });
        const sql = `SELECT displayName 
                FROM profile 
                WHERE profileID = (SELECT MAX(profileID)
                                    FROM profile)`;
        connection.connect();
        connection.query(sql, (error, results) => {
            if (error) console.log(error);
            res.send({
                status: "success",
                rows: results
            });
        });
        connection.end();
    } else {
        // If the user is not logged in
        res.redirect("/");
    }
});

app.get('/get-about', (req, res) => {
    // If the user is loggedin
    if (req.session.loggedin) {
        const connection = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'talkit'
        });

        const sql = `SELECT about 
                FROM profile 
                WHERE profileID = (SELECT MAX(profileID)
                                    FROM profile)`;
        connection.connect();
        connection.query(sql, (error, results) => {
            if (error) console.log(error);
            res.send({
                status: "success",
                rows: results
            });
        });
        connection.end();
    } else {
        // If the user is not logged in
        res.redirect("/");
    }
});

app.post('/add-profile', (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    let connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'talkit'
    });

    let sql = `INSERT INTO profile (userID, displayName, about)
                values ((SELECT id FROM user WHERE email = ?), ?, ?)`;
    connection.connect();
    connection.query(sql,
        [req.body.email, req.body.displayName, req.body.about],
        (error, results, fields) => {
            if (error) {
                console.log(error);
            }
            res.send({
                status: "success",
                msg: "Record added."
            });

        });
    connection.end();

});

app.get('/get-users', (req, res) => {
    // If the user is loggedin
    if (req.session.loggedin) {
        const connection = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'talkit'
        });
        connection.connect();
        connection.query('SELECT * FROM BBY_01_user', (error, results) => {
            if (error) console.log(error);
            res.send({
                status: "success",
                rows: results
            });
        });
        connection.end();
    } else {
        // If the user is not logged in
        res.redirect("/");
    }
});

app.post('/add-user', (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    let connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'talkit'
    });

    connection.connect();
    connection.query('INSERT INTO BBY_01_user (username, email, password, isAdmin) values(?, ?, ?, ?)',
        [req.body.username, req.body.email, req.body.password, req.body.isAdmin],
        (error, results, fields) => {
            if (error) console.log(error);
            res.send({
                status: "success",
                msg: "Record added."
            });
        });
    connection.end();
});

app.post('/update-user', (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    let connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'talkit'
    });
    connection.connect();
    connection.query('UPDATE BBY_01_user SET username = ?, email = ?, password = ?, isAdmin = ? WHERE ID = ?',
        [req.body.name, req.body.email, req.body.password, req.body.isAdmin, req.body.id],
        (error, results) => {
            if (error) console.log(error);

            res.send({
                status: "success",
                msg: "Recorded updated."
            });
        });
    connection.end();
})

app.post('/delete-user', (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    let connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'talkit'
    });
    connection.connect();
    let deleteSql = `DELETE 
                    FROM BBY_01_user 
                    WHERE ID =?`;
    connection.query(deleteSql,
        [req.body.id],
        (error, results) => {
            if (error) console.log(error);
            res.send({
                status: "success",
                msg: "Record deleted"
            })
        })
    connection.end();
})

app.get("/logout", (req, res) => {
    // If the user is logged in
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

async function init() {
    const mysql = require("mysql2/promise");
    const connection = await mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        multipleStatements: true
    });
    const sql = `CREATE DATABASE IF NOT EXISTS talkit;
        use talkit;
        Drop table bby_01_user;
        CREATE TABLE IF NOT EXISTS BBY_01_user (
        ID int NOT NULL AUTO_INCREMENT,
        username varchar(30),
        email varchar(30),
        password varchar(20),
        isAdmin int NOT NULL,
        PRIMARY KEY (ID));`;
    await connection.query(sql);


    const [rows, fields] = await connection.query("SELECT * FROM BBY_01_user");
    if (rows.length == 0) {
        // Dummy data
        let userRecords = "insert into BBY_01_user (username, email, password, isAdmin) values ?";
        let recordValues = [
            ["test", "test@test.com", "test", 0],
            ["joe", "joe@bcit.ca", "abc123", 1],
            ["bob", "bob@bcit.ca", "xyz", 1]
        ];
        await connection.query(userRecords, [recordValues]);
    }
    console.log("Listening on port " + port + "!");

}

// RUN SERVER
let port = 8000;
app.listen(port, init);