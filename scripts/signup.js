const express = require('express');
const app = express();
const fs = require("fs");
const mysql = require('mysql2');

app.use("/css", express.static("../styles"));
app.use("/img", express.static("../images"));
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

app.get('/', function (req, res) {
    // Build the DB 
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        multipleStatements: true
    });

    const createDBAndTables = `CREATE DATABASE IF NOT EXISTS talkit;
          use talkit;
          CREATE TABLE IF NOT EXISTS user (
          ID int NOT NULL AUTO_INCREMENT,
          username varchar NOT NULL(30),
          email varchar NOT NULL(30),
          password varchar NOT NULL(30),
          PRIMARY KEY (ID));`;

    connection.connect();
    connection.query(createDBAndTables, function (error, results, fields) {
        if (error) {
            console.log(error);
        }
        console.log(results);

    });
    connection.end();

    let doc = fs.readFileSync('../signup.html', "utf8");
    res.send(doc);
});


// Notice that this is a 'POST'
app.post('/add-user', function (req, res) {
    res.setHeader('Content-Type', 'application/json');

    console.log("Username", req.body.username);
    console.log("Email", req.body.email);
    console.log("Password", req.body.password);

    let connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'talkit'
    });
    connection.connect();

    // TO PREVENT SQL INJECTION, DO THIS:
    connection.query('INSERT INTO user (username, email, password) values (?, ?, ?)',
        [req.body.username, req.body.email, req.body.password],
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

// RUN SERVER
let port = 8000;
app.listen(port, function () {
    console.log('Sign Up page listening on port ' + port);
})