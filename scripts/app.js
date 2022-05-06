const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');
const fs = require("fs");
const {JSDOM} = require('jsdom');
const path = require('path');
const app = express();

app.use("/img", express.static("./images"));
app.use("/css", express.static("../styles"));

const connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'talkit'
});

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));


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
    let doc = fs.readFileSync('../login.html', "utf-8");
    res.send(doc);
});

app.post('/auth', function(request, response) {
	// Capture the input fields
	let username = request.body.username;
	let password = request.body.password;
	// Ensure the input fields exists and are not empty
    console.log(username, password);
	if (username && password) {
		// Execute SQL query that'll select the account from the database based on the specified username and password
		connection.query('SELECT * FROM user WHERE name = ? AND password = ?', [username, password], function(error, results, fields) {
			// If there is an issue with the query, output the error
			if (error) throw error;
			// If the account exists
			if (results.length > 0) {
				// Authenticate the user
				request.session.loggedin = true;
				request.session.username = username;
				// Redirect to home page
				response.redirect('/home');
				
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.get('/home', function(request, response) {
	// If the user is loggedin
	if (request.session.loggedin) {
		let profile = fs.readFileSync("../main.html", "utf8");
        let profileDOM = new JSDOM(profile);
		response.send(profileDOM.serialize());
	} else {
		// If the user is not logged in
		response.redirect("/");
	}
	response.end();
});

app.get('/admin', function(request, response) {
	// Render login template
    let doc = fs.readFileSync('../users.html', "utf-8");
    response.send(doc);
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

app.get("/logout", function (req, res) {
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



let port = 8000;
app.listen(port, function () {
    console.log('Test app listening on port ' + port + '!');
  })