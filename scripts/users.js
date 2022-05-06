
const express = require('express');
const app = express();
const fs = require("fs");
const mysql = require('mysql2');

app.use("/img", express.static("./images"));
app.use("/css", express.static("../styles"));

app.get('/', function (req, res) {

    const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    multipleStatements: true
    });

    const sql = `CREATE DATABASE IF NOT EXISTS talkit;
        use talkit;
        CREATE TABLE IF NOT EXISTS user (
        ID int NOT NULL AUTO_INCREMENT,
        name varchar(30),
        email varchar(30),
        password varchar(20),
        PRIMARY KEY (ID));`;
    
    connection.connect();
    connection.query(sql, (error, results) => {
        if (error) console.log(error);
        console.log(results);
    });
    connection.end();
    let doc = fs.readFileSync('../users.html', "utf-8");
    res.send(doc);
});

app.get('/get-users', (req, res) => {
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'talkit'
    });
    connection.connect();
    connection.query('SELECT * FROM user', (error, results) => {
        if (error) console.log(error);
        console.log('Rows returned are: ', results);
        res.send({ status: "success", rows: results });
    });
    connection.end();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/add-user', (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    console.log("Name", req.body.name);
    console.log("Email", req.body.email);
    console.log("Password", req.body.password);

    let connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'talkit'
    });

    connection.connect();
    // console.log("name: ", req.body.name, " email: ", req.body.email, " password: ", req.body.password);
    connection.query('INSERT INTO user (name, email, password) values(?, ?, ?)',
                [req.body.name, req.body.email, req.body.password],
                (error, results, fields) => {
                    if (error) console.log(error);
                    // console.log('Rows reutrned are: ', results);
                    res.send({ status: "success", msg: "Record added."});
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
    // console.log("Update values id: ", req.body.id, " user name: ", req.body.name, " email: ", req.body.name, " password: ", req.body.password)
    connection.query('UPDATE user SET name = ?, email = ?, password = ? WHERE ID = ?',
                [req.body.name, req.body.email, req.body.password, req.body.id],
                (error, results) => {
                    if (error) console.log(error);

                    res.send({ status: "success", msg: "Recorded updated."});
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
                    FROM user 
                    WHERE ID =?`;
    connection.query(deleteSql, 
        [req.body.id],
        (error, results)=> {
            if (error) console.log(error);
            res.send({ status: "success", msg: "Record deleted"})
        })
    connection.end();
})

let port = 8000;
app.listen(port, () => {
    console.log('App listening on port ' + port);
})