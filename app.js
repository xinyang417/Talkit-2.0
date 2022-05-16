"use strict";
const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');
const fs = require("fs");
const {
    JSDOM
} = require('jsdom');
const path = require('path');
const {
    res
} = require('express');
const multer = require("multer");
const {
    connect
} = require('http2');
const ConnectionConfig = require('mysql/lib/ConnectionConfig');
const { profile } = require('console');
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
    multipleStatements: false,
    database: 'COMP2800'
};

// Remote Database
const dbConfigHeroku = {
    host: "us-cdbr-east-05.cleardb.net",
    user: "b459ce75b586dd",
    password: "7790c83a",
    multipleStatements: false,
    database: "heroku_7ab302bab529edd"
};

// Creates Connection to Database
if (is_heroku) {
    var database = mysql.createPool(dbConfigHeroku);
} else {
    var database = mysql.createPool(dbConfigLocal);
}

app.get('/', (req, res) => {
    if (!req.session.loggedin) {
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
    // Capture the input fields
    let username = req.body.username;
    let password = req.body.password;
    // Ensure the input fields exists and are not empty
    if (username && password) {
        // Execute SQL query that'll select the account from the database based on the specified username and password
        database.query('SELECT * FROM BBY_01_user WHERE username = ? AND password = ?',
            [username, password],
            function (error, results, fields) {

                // If there is an issue with the query, output the error
                if (error) throw error;
                // If the account exists
                if (results.length > 0 && results[0].isAdmin == 1) {
                    // Authenticate the user
                    req.session.loggedin = true;
                    req.session.username = username;
                    req.session.isAdmin = results[0].isAdmin;
                    req.session.userid = results[0].ID;
                    req.session.email = results[0].email;
                    req.session.password = results[0].password;

                    // Redirect to admin page
                    res.send({
                        status: "success",
                        msg: "Logged in."
                    });

                } else if (results.length > 0) {
                    // Authenticate the user
                    req.session.loggedin = true;
                    req.session.username = username;
                    req.session.isAdmin = results[0].isAdmin;
                    req.session.userid = results[0].ID;
                    req.session.email = results[0].email;
                    req.session.password = results[0].password;


                    // Redirect to home page
                    res.send({
                        status: "success",
                        msg: "Logged in."
                    });
                } else {
                    // Print Error Message
                    res.send({
                        status: "fail",
                        msg: "User account not found."
                    });
                }
                res.end();
            });
    } else {
        // Print Error Message
        res.send({
            status: "empty",
            msg: "Username and Password cannot be empty."
        });
        res.end();
    }
});

app.post('/check-account', (req, res) => {
    let username = req.body.username;
    let email = req.body.email;
    let password = req.body.password;
    let checkUsername = false;
    let checkEmail = false;

    if (username && password && email) {
        database.query('SELECT * from bby_01_user', (error, results) => {
            if (error) throw error
            for (let i = 0; i < results.length; i++) {
                if (results[i].username == username) {
                    checkUsername = true;
                    break;
                }
            }
            for (let i = 0; i < results.length; i++) {
                if (results[i].email == email) {
                    checkEmail = true;
                    break;
                }
            }
            if (checkEmail) {
                res.send({
                    status: "email existed",
                    msg: "You already signed up with this email."
                });
            } else if (checkUsername) {
                res.send({
                    status: "invalid username",
                    msg: "Username already in use."
                });
            } else {
                res.send({
                    status: "success",
                    msg: "Signed up"
                });
            }
            res.end();
        });
    } else {
        res.send({
            status: "empty",
            msg: "Please fill in all the fields."
        });
        res.end();
    }


})

app.get('/home', (req, res) => {
    
    // If the user is logged in
    if (req.session.loggedin) {
        const sql = `SELECT * FROM BBY_01_timeline ORDER BY postID DESC;`
        let profile = fs.readFileSync("./main.html", "utf8");
        let profileDOM = new JSDOM(profile);
        // let titleCollection = profileDOM.window.document.getElementById("postTitle").innerHTML;
        // let authorCollection = profileDOM.window.document.getElementById("author").innerHTML;
        // database.query(sql, (error, results) => {
        //     if (error) throw error;
        //     for (let i = 0; i < results.length; i++) {
        //         titleCollection[i].innerHTML = results[0].title;
        //         authorCollection[i].innerHTML = results[0].displayName;
        //     }
            res.send(profileDOM.serialize());
            res.end();
        // })
        
        profileDOM.window.document.getElementById("greetUser").innerHTML = "Hello, " + req.session.username;
        if (req.session.isAdmin == 0) {
            profileDOM.window.document.getElementById("dBoard").remove();
            profileDOM.window.document.getElementById("dashboard-icon").remove();
            
        }
        
    } else {
        // If the user is not logged in
        res.redirect("/");
        res.end();
    }
    
});

app.get('/share-story', (req, res) => {
    if (req.session.loggedin) {
        // Render login template
        let doc = fs.readFileSync('./share_story.html', "utf-8");
        res.send(doc);
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
    } else if (req.session.loggedin) {
        // If the user is not logged in
        res.redirect("/home");
    } else {
        res.redirect("/");
    }
    res.end();
});

app.get('/profile', (req, res) => {
    // If the user is logged in
    if (req.session.loggedin) {

        const sql = ` INSERT INTO profile(userID, displayName, about, profilePic)
        SELECT * FROM (SELECT ? AS userID, '' AS displayName, '' AS about, 'logo-04.png' AS profilePic) AS tmp
        WHERE NOT EXISTS (SELECT userID
                            FROM profile
                            WHERE userID = ?) LIMIT 1;`;
        database.query(sql, [req.session.userid, req.session.userid, req.session.userid], (error, results, fields) => {
            if (error) {
                console.log(error);
            }
        });
        let doc = fs.readFileSync('./profile.html', "utf8");
        let profileDOM = new JSDOM(doc);
        if (req.session.isAdmin == 0) {
            profileDOM.window.document.querySelector("#dashboard").remove();
        }
        profileDOM.window.document.getElementById("uName").innerHTML = req.session.username + "'s Profile";
        res.send(profileDOM.serialize());
    } else {
        // If the user is not logged in
        res.redirect("/");
    }
});

app.get('/update-profile', (req, res) => {
    // If the user is loggedin
    if (req.session.loggedin) {
        let doc = fs.readFileSync('./update-profile.html', "utf-8");
        let profileDOM = new JSDOM(doc);
        profileDOM.window.document.getElementById("email").setAttribute("value", req.session.email);
        profileDOM.window.document.getElementById("password").setAttribute("value", req.session.password);
        if (req.session.isAdmin == 0) {
            profileDOM.window.document.querySelector("#dashboard").remove();
        }
        profileDOM.window.document.getElementById("uName").innerHTML = req.session.username;
        res.send(profileDOM.serialize());
    } else {
        // If the user is not logged in
        res.redirect("/");
    }
})

app.post('/upload-images', upload.array("files"), (req, res) => {

    const sql = `UPDATE profile
                SET profilePic = ?
                WHERE userID = ?`;
    database.query(sql, [req.files[0].filename, req.session.userid], (error, results) => {
        if (error) console.log(error);
        res.send({
            status: "success",
            rows: results
        });
    });
});

app.get('/get-displayname', (req, res) => {
    // If the user is loggedin
    if (req.session.loggedin) {

        const sql = `SELECT * 
                FROM profile 
                WHERE userID = ?`;

        database.query(sql, [req.session.userid], (error, results) => {
            if (error) console.log(error);
            res.send({
                status: "success",
                rows: results
            });
        });
    } else {
        // If the user is not logged in
        res.redirect("/");
    }
});

app.get('/get-about', (req, res) => {
    // If the user is loggedin
    if (req.session.loggedin) {
    
        const sql = `SELECT * 
                FROM profile 
                WHERE userID = ?`;
    
        database.query(sql, [req.session.userid], (error, results) => {
            if (error) console.log(error);
            res.send({
                status: "success",
                rows: results
            });
        });
     
    } else {
        // If the user is not logged in
        res.redirect("/");
    }
});

app.get('/get-profilePic', (req, res) => {
    if (req.session.loggedin) {

        const sql = `SELECT *
                    FROM profile
                    WHERE userID = ?`;
  
        database.query(sql, [req.session.userid], (error, results) => {
            if (error) console.log(error);
            res.send({
                status: "success",
                rows: results
            });
        });
     
    } else {
        res.redirect("/");
    }
});

app.get('/get-username', (req, res) => {
    if (req.session.loggedin) {

        const sql = `SELECT * 
                FROM bby_01_user 
                WHERE ID = ?`;

        database.query(sql, [req.session.userid], (error, results) => {
            if (error) console.log(error);
            res.send({
                status: "success",
                rows: results
            });
        });
    
    } else {
        // If the user is not logged in
        res.redirect("/");
    }
});

app.post('/update-profile', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    let newName = req.body.displayName;
    let newAbout = req.body.about;
    let newEmail = req.body.email;
    let newPassword = req.body.password;
    let sql;
    let message = "Profile updated.";
    
    if (newAbout != '') {
        sql = `UPDATE profile
                SET about = ?
                WHERE userID = ?`;
        database.query(sql, [newAbout, req.session.userid],
            (error, results, fields) => {
                if (error) console.log(error);
                message = "About updated."
            });
    }
    if (newName != '') {
        sql = `UPDATE profile
                SET displayName = ?
                WHERE userID = ?`;
        database.query(sql, [newName, req.session.userid],
            (error, results, fields) => {
                if (error) console.log(error);
                message = "Display name updated."
            });
    }
    if (newEmail != '') {
        sql = `UPDATE bby_01_user
                SET email = ?
                WHERE ID = ?`;
        req.session.email = newEmail;
        database.query(sql, [newEmail, req.session.userid], (error, results, fields) => {
            if (error) console.log(error);
            message = "Email updated."
        });
    }
    if (newPassword != '') {
        sql = `UPDATE bby_01_user
                SET password = ?
                WHERE ID = ?`;
        req.session.password = newPassword;
        database.query(sql, [newPassword, req.session.userid], (error, results, fields) => {
            if (error) console.log(error);
            message = "Password updated."
        })
    }
    res.send({
        status: "success",
        msg: message
    });
});

app.get('/get-users', (req, res) => {
    // If the user is logged in
    if (req.session.loggedin) {
        database.query('SELECT * FROM BBY_01_user', (error, results) => {
            if (error) console.log(error);
            res.send({
                status: "success",
                rows: results
            });
        });
    } else {
        // If the user is not logged in
        res.redirect("/");
    }
});

app.get('/get-posts', (req, res) => {
    // If the user is logged in
    if (req.session.loggedin) {
        database.query('SELECT * FROM BBY_01_timeline', (error, results) => {
            if (error) console.log(error);
            res.send({
                status: "success",
                rows: results
            });
        });
    } else {
        // If the user is not logged in
        res.redirect("/");
    }
});

app.post('/add-user', (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    database.query('INSERT INTO BBY_01_user (username, email, password, isAdmin) values(?, ?, ?, ?)',
        [req.body.username, req.body.email, req.body.password, req.body.isAdmin],
        (error, results, fields) => {
            if (error) console.log(error);
            res.send({
                status: "success",
                msg: "Record added."
            });
        });
});

app.post('/update-user', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    database.query('UPDATE BBY_01_user SET username = ?, email = ?, password = ?, isAdmin = ? WHERE ID = ?',
        [req.body.username, req.body.email, req.body.password, req.body.isAdmin, req.body.id],
        (error, results) => {
            if (error) console.log(error);
            res.send({
                status: "success",
                msg: "Record updated."
            });
        });
})

app.post('/delete-user', (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    let adminLeft = `SELECT *
                    FROM BBY_01_user
                    WHERE isAdmin = 1`;
    let checkAdmin = `SELECT isAdmin
                    FROM bby_01_user
                    WHERE ID = ?`;
    var numberOfAdmin;
    var accountType;
    database.query(checkAdmin, [req.body.id], (error, results) => {
        if (error) console.log(error);
        accountType = results[0].isAdmin;
    });
    database.query(adminLeft, (error, results) => {
        if (error) console.log(error);
        numberOfAdmin = results.length;
        if (numberOfAdmin == 1 && accountType == 1) {
            res.send({
                status: "fail",
                msg: "The account is the last admin account."
            });
        } else {
            deleteSQL(req, res);
        }
    });
});

function deleteSQL(req, res) {
    let deleteSql = `DELETE 
                    FROM BBY_01_user 
                    WHERE ID = ?`;
    database.query(deleteSql,
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


/**
 * Code for Connection Error handling while hosting.
 * I found this code on stackoverflow.com.
 * 
 * @author https://stackoverflow.com/users/395659/cloudymarble
 * @see https://stackoverflow.com/questions/20210522/nodejs-mysql-error-connection-lost-the-server-closed-the-connection
 */
var connection;

function handleDisconnect() {
    if (is_heroku){
        connection = mysql.createConnection(dbConfigHeroku); // Recreate the connection, since
                                                  // the old one cannot be reused.

        connection.connect(function(err) {              // The server is either down
            if(err) {                                     // or restarting (takes a while sometimes).
                console.log('error when connecting to db:', err);
                setTimeout(handleDisconnect, 2000); 
            }                                     
        });                                     
        connection.on('error', function(err) {
            if(err.code === 'PROTOCOL_CONNECTION_LOST') { 
                handleDisconnect();                        
            } else {                                      
                throw err;                                  
            }
        });
    }
}

handleDisconnect();

// RUN SERVER REMOTELY
if (is_heroku) {
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
        console.log('Server is running on port ' + PORT + ' .');
    });
} else {
    // RUN SERVER LOCALLY
    let port = 8000;
    app.listen(port, () => {
        console.log("Listening on port " + port + "!");
    })
}