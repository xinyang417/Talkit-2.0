"use strict";
const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');
const fs = require("fs");
const { JSDOM } = require('jsdom');
const path = require('path');
const { res } = require('express');
const multer = require("multer");
const { connect } = require('http2');
const ConnectionConfig = require('mysql/lib/ConnectionConfig');
const app = express();


app.use("/img", express.static("./images"));
app.use("/css", express.static("./styles"));
app.use("/js", express.static("./js"));
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
        callback(null, "./images/")
    },
    filename: function (req, file, callback) {
        callback(null, "my-app-" + file.originalname.split('/').pop().trim());
    }
});

const upload = multer({
    storage: storage
});

// Variable to determine if db connection is remote or local
const is_heroku = process.env.IS_HEROKU || false;

// Local Database
const dbConfigLocal = {
    host: 'localhost',
    user: 'root',
    password: '',
    multipleStatements: true,
    database: 'COMP2800'
};

// Remote Database
const dbConfigHeroku = {
    host:"us-cdbr-east-05.cleardb.net",
    user: "b459ce75b586dd",
    password: "7790c83a",
    database: "heroku_7ab302bab529edd"
}

app.get('/', (req, res) => {
    if (!req.session.loggedin) {
        if(is_heroku) {
            var database = mysql.createConnection(dbConfigHeroku);
        } else {
            var database = mysql.createConnection(dbConfigLocal);
        }
    const sql = `CREATE DATABASE IF NOT EXISTS COMP2800;
        use COMP2800;
        CREATE TABLE IF NOT EXISTS BBY_01_user (
        ID int NOT NULL AUTO_INCREMENT,
        username varchar(30),
        email varchar(30),
        password varchar(20),
        isAdmin int,
        UNIQUE (email),
        PRIMARY KEY (ID));`;

    database.connect();
    database.query(sql, (error, results) => {
        if (error) console.log(error);
    });
    database.end();
    let doc = fs.readFileSync('./login.html', "utf-8");
    res.send(doc);
} else {
    res.redirect('/home');
}
});

app.get('/signup', (req, res) => {
    let doc = fs.readFileSync('./signup.html', "utf-8");
    res.send(doc);
})


app.post('/auth', (req, res) => {
    if (is_heroku) {
        var database = mysql.createConnection(dbConfigHeroku);
    } else {
        var database = mysql.createConnection(dbConfigLocal);
    }
    // Capture the input fields
    let username = req.body.username;
    let password = req.body.password;
    // Ensure the input fields exists and are not empty
    if (username && password) {
        // Execute SQL query that'll select the account from the database based on the specified username and password
        database.query('SELECT * FROM BBY_01_user WHERE username = ? AND password = ?',
                        [username, password], function (error, results, fields) {
            
            // If there is an issue with the query, output the error
            if (error) throw error;
            // If the account exists
            if (results.length > 0 && results[0].isAdmin == 1) {
                // Authenticate the user
                req.session.loggedin = true;
                req.session.username = username;
                req.session.isAdmin = results[0].isAdmin;
                req.session.userid = results[0].ID;
                
                
                // Redirect to home page
                res.redirect('/admin');

            } else if (results.length > 0) {
                // Authenticate the user
                req.session.loggedin = true;
                req.session.username = username;
                req.session.isAdmin = results[0].isAdmin;
                req.session.userid = results[0].ID;
                
                // Redirect to home page
                res.redirect('/home');
            } else {
                // res.send('Incorrect Username and/or Password!');
                res.send({
                    status: "fail",
                    msg: "User account not found."
                });
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
        let profile = fs.readFileSync("./main.html", "utf8");
        let profileDOM = new JSDOM(profile);
        res.send(profileDOM.serialize());
    } else {
        // If the user is not logged in
        res.redirect("/");
    }
    
    res.end();
});

app.get('/admin', (req, res) => {
    // If the user is logged in
    if (req.session.loggedin && req.session.isAdmin > 0) {
        // Render login template
        let doc = fs.readFileSync('./users.html', "utf-8");
        res.send(doc);
    } else {
        // If the user is not logged in
        res.redirect("/home");
        
    }
    res.end();
});

app.get('/profile', (req, res) => {
    // If the user is logged in
    if (req.session.loggedin) {
        if (is_heroku) {
            var database = mysql.createConnection(dbConfigHeroku);
        } else {
            var database = mysql.createConnection(dbConfigLocal);
        }
        const sql = `CREATE DATABASE IF NOT EXISTS COMP2800;
        use COMP2800;
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
        INSERT INTO profile(userID, displayName, about, profilePic)
        SELECT * FROM (SELECT ? AS userID, '' AS displayName, '' AS about, 'logo-04.png' AS profilePic) AS tmp
        WHERE NOT EXISTS (SELECT userID
                            FROM profile
                            WHERE userID = ?) LIMIT 1;`;
        
        
        database.connect();
        database.query(sql, [req.session.userid, req.session.userid], (error, results, fields) => {
            if (error) {
                console.log(error);
            }
        });
        database.end();

        let doc = fs.readFileSync('./profile.html', "utf8");
        res.send(doc);
    } else {
        // If the user is not logged in
        res.redirect("/");
    }
});

app.get('/update-profiles', (req, res) => {
    // If the user is loggedin
    if (req.session.loggedin) {
        let doc = fs.readFileSync('./update-profile.html', "utf-8");
        res.send(doc);
    } else {
        // If the user is not logged in
        res.redirect("/");
    }
})

app.post('/upload-images', upload.array("files"), (req, res) => {
    console.log(req.files[0].filename);
    if (is_heroku) {
        var database = mysql.createConnection(dbConfigHeroku);
    } else {
        var database = mysql.createConnection(dbConfigLocal);
    }
    const sql = `UPDATE profile
                SET profilePic = ?
                WHERE userID = ?`;
    database.connect();
    database.query(sql, [req.files[0].filename, req.session.userid], (error, results) =>{
        if(error) console.log(error);
        res.send({
            status: "success",
            rows: results
        });
    });
});

app.get('/get-displayname', (req, res) => {
    // If the user is loggedin
    if (req.session.loggedin) {
        if (is_heroku) {
            var database = mysql.createConnection(dbConfigHeroku);
        } else {
            var database = mysql.createConnection(dbConfigLocal);
        }
        const sql = `SELECT * 
                FROM profile 
                WHERE userID = ?`;
        database.connect();
        database.query(sql, [req.session.userid], (error, results) => {
            if (error) console.log(error);
            res.send({
                status: "success",
                rows: results
            });
        });
        database.end();
    } else {
        // If the user is not logged in
        res.redirect("/");
    }
});

app.get('/get-about', (req, res) => {
    // If the user is loggedin
    if (req.session.loggedin) {
        if (is_heroku) {
            var database = mysql.createConnection(dbConfigHeroku);
        } else {
            var database = mysql.createConnection(dbConfigLocal);
        }

        const sql = `SELECT * 
                FROM profile 
                WHERE userID = ?`;
        database.connect();
        database.query(sql, [req.session.userid], (error, results) => {
            if (error) console.log(error);
            res.send({
                status: "success",
                rows: results
            });
        });
        database.end();
    } else {
        // If the user is not logged in
        res.redirect("/");
    }
});

app.get('/get-profilePic', (req, res) => {
    if (req.session.loggedin) {
        if (is_heroku) {
            var database = mysql.createConnection(dbConfigHeroku);
        } else {
            var database = mysql.createConnection(dbConfigLocal);
        }

        const sql = `SELECT *
                    FROM profile
                    WHERE userID = ?`;
        database.connect();
        database.query(sql, [req.session.userid], (error, results) => {
            if(error) console.log(error);
            res.send ({
                status: "success",
                rows: results
            });
        });
        database.end();
    } else {
        res.redirect("/");
    }
});

app.get('/get-username', (req, res) => {
    if (req.session.loggedin) {
        if (is_heroku) {
            var database = mysql.createConnection(dbConfigHeroku);
        } else {
            var database = mysql.createConnection(dbConfigLocal);
        }

        const sql = `SELECT * 
                FROM bby_01_user 
                WHERE ID = ?`;
        database.connect();
        database.query(sql, [req.session.userid], (error, results) => {
            if (error) console.log(error);
            res.send({
                status: "success",
                rows: results
            });
        });
        database.end();
    } else {
        // If the user is not logged in
        res.redirect("/");
    }
});

app.post('/update-profile', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    if (is_heroku) {
        var database = mysql.createConnection(dbConfigHeroku);
    } else {
        var database = mysql.createConnection(dbConfigLocal);
    }
    let newName = req.body.displayName;
    let newAbout = req.body.about;
    let sql;
    database.connect();
    if (newAbout != '' && newName != '') {
        sql = `UPDATE profile
                SET about = ?, displayName = ?
                WHERE userID = ?`;
        database.query(sql, [newAbout, newName, req.session.userid],
            (error, results, fields) => {
                if (error) console.log(error);
                res.send({
                    status: "succes",
                    msg: "About updated."
                });
            });
    } else if(newAbout != '') {
        sql = `UPDATE profile
                SET about = ?
                WHERE userID = ?`;
        database.query(sql, [newAbout, req.session.userid],
            (error, results, fields) => {
                if (error) console.log(error);
                res.send({
                    status: "succes",
                    msg: "About updated."
                });
            });
    } else if (newName != '') {
        sql = `UPDATE profile
                SET displayName = ?
                WHERE userID = ?`;
        database.query(sql, [newName, req.session.userid],
            (error, results, fields) => {
                if (error) console.log(error);
                res.send({
                    status: "succes",
                    msg: "Display name updated."
                });
            });
    }
    
    database.end();

});

app.get('/get-users', (req, res) => {
    // If the user is loggedin
    if (req.session.loggedin) {
        if (is_heroku) {
            var database = mysql.createConnection(dbConfigHeroku);
        } else {
            var database = mysql.createConnection(dbConfigLocal);
        }
        database.connect();
        database.query('SELECT * FROM BBY_01_user', (error, results) => {
            if (error) console.log(error);
            res.send({
                status: "success",
                rows: results
            });
        });
        database.end();
    } else {
        // If the user is not logged in
        res.redirect("/");
    }
});

app.post('/add-user', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    if (is_heroku) {
        var database = mysql.createConnection(dbConfigHeroku);
    } else {
        var database = mysql.createConnection(dbConfigLocal);
    }
    database.connect();
    database.query('INSERT INTO BBY_01_user (username, email, password, isAdmin) values(?, ?, ?, ?)',
        [req.body.username, req.body.email, req.body.password, req.body.isAdmin],
        (error, results, fields) => {
            if (error) console.log(error);
            res.send({
                status: "success",
                msg: "Record added."
            });
        });
    database.end();
});

app.post('/update-user', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    if (is_heroku) {
        var database = mysql.createConnection(dbConfigHeroku);
    } else {
        var database = mysql.createConnection(dbConfigLocal);
    }
    database.connect();
    database.query('UPDATE BBY_01_user SET username = ?, email = ?, password = ?, isAdmin = ? WHERE ID = ?',
        [req.body.username, req.body.email, req.body.password, req.body.isAdmin, req.body.id],
        (error, results) => {
            if (error) console.log(error);

            res.send({
                status: "success",
                msg: "Recorded updated."
            });
        }); 
    database.end();
})

app.post('/delete-user', (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    let connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        multipleStatements: true,
        database: 'COMP2800'
    });
    connection.connect();
    let adminLeft = `SELECT *
                    FROM BBY_01_user
                    WHERE isAdmin = 1`;
    let checkAdmin = `SELECT isAdmin
                    FROM bby_01_user
                    WHERE ID = ?`;
    var numberOfAdmin;
    var accountType;
    connection.query(checkAdmin, [req.body.id], (error, results) => {
        if (error) console.log(error);
        accountType = results[0].isAdmin;
    });
    connection.query(adminLeft, (error, results) => {
        if (error) console.log(error);
        numberOfAdmin = results.length;
        if (numberOfAdmin == 1 && accountType == 1) {
            res.send({
                status: "fail",
                msg:"The account is the last admin account."
            });
        } else {
            deleteSQL(req, res);
        }
    });
    connection.end();
});

function deleteSQL(req, res) {
    let connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        multipleStatements: true,
        database: 'COMP2800'
    });
    connection.connect();
    let deleteSql = `DELETE 
                    FROM BBY_01_user 
                    WHERE ID = ?`;
    connection.query(deleteSql,
        [req.body.id],
        (error, results) => {
            if (error) console.log(error);
            
            res.send({
                status: "success",
                msg: "Record deleted"
            });
        });
}

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
    if (!is_heroku) {
    const mysql = require("mysql2/promise");

    const localConnection = await mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        multipleStatements: true
    });
    const sql = `CREATE DATABASE IF NOT EXISTS COMP2800;
    use COMP2800;
    CREATE TABLE IF NOT EXISTS BBY_01_user (
    ID int NOT NULL AUTO_INCREMENT,
    username varchar(30),
    email varchar(30),
    password varchar(20),
    isAdmin int NOT NULL,
    PRIMARY KEY (ID));`;
    await localConnection.query(sql);


    const [rows, fields] = await localConnection.query("SELECT * FROM BBY_01_user");
    if (rows.length == 0) {
        // Dummy data
        let userRecords = "insert into BBY_01_user (username, email, password, isAdmin) values ?";
        let recordValues = [
            ["test", "test@test.com", "test", 0],
            ["joe", "joe@bcit.ca", "abc123", 1],
            ["bob", "bob@bcit.ca", "xyz", 1]
        ];
        await localConnection.query(userRecords, [recordValues]);
    }
    console.log("Listening on port " + port + "!");
}
}

// RUN SERVER
let port = 8000;
if (is_heroku) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log('Server is running on port ' + PORT + ' .');
    });
} 
else {
    app.listen(port, init);

}




