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
const {
    profile
} = require('console');
const {
    resourceLimits
} = require('worker_threads');
const { newObjectInRealm } = require('jsdom/lib/jsdom/living/generated/utils');
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
        const sql = ` INSERT INTO bby_01_profile(userID, displayName, about, profilePic)
                        SELECT * FROM (SELECT ? AS userID, ? AS displayName, '' AS about, 'logo-04.png' AS profilePic) AS tmp
                        WHERE NOT EXISTS (SELECT userID
                                            FROM bby_01_profile
                                            WHERE userID = ?) LIMIT 1;`;
        database.query(sql, [req.session.userid, req.session.username, req.session.userid, req.session.userid], (error, results, fields) => {
            if (error) {
                console.log(error);
            }
        });

        let profile = fs.readFileSync("./main.html", "utf8");
        let profileDOM = new JSDOM(profile);
        profileDOM.window.document.getElementById("greetUser").innerHTML = "Hello, " + req.session.username;
        if (req.session.isAdmin == 0) {
            profileDOM.window.document.getElementById("dBoard").remove();
            profileDOM.window.document.getElementById("dashboard-icon").remove();
        }
        res.send(profileDOM.serialize());
        res.end();

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
        let profileDOM = new JSDOM(doc);
        if (req.session.isAdmin == 0) {
            profileDOM.window.document.getElementById("dashboard").remove();
        }
        res.send(profileDOM.serialize());
        res.end();

    } else {
        // If the user is not logged in
        res.redirect("/");
        res.end();
    }

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

app.get('/get-users', (req, res) => {
    // If the user is logged in
    if (req.session.loggedin) {
        let sql = `SELECT * FROM BBY_01_user
                    LEFT JOIN bby_01_profile
                    ON BBY_01_user.ID = bby_01_profile.userID
                    ORDER BY ID ASC;`;
        database.query(sql, (error, results) => {
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
    let sql = `INSERT INTO BBY_01_user (username, email, password, isAdmin) 
                values(?, ?, ?, ?);`
    database.query(sql,
        [req.body.username, req.body.email, req.body.password, req.body.isAdmin],
        (error, results, fields) => {
            if (error) console.log(error);
            sql = `SELECT * FROM bby_01_user
                    ORDER BY ID DESC LIMIT 1;`;
            database.query(sql, (error, results) => {
                if (error) throw error;
                sql = `INSERT INTO bby_01_profile(userID, displayName, about, profilePic)
                        SELECT * 
                        FROM (SELECT ? AS userID, ? AS displayName, '' AS about, 'logo-04.png' AS profilePic) AS tmp
                        WHERE NOT EXISTS (SELECT userID
                            FROM bby_01_profile
                            WHERE userID = ?) LIMIT 1;`;
                database.query(sql, [results[0].ID, results[0].username, results[0].ID], (error, results) => {
                    if (error) throw error;
                    res.send({
                        status: "success",
                        msg: "Record added."
                    });
                });
            });
        });
});

app.post('/update-user', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    let sql = `UPDATE BBY_01_user 
                SET username = ?, email = ?, password = ?, isAdmin = ? WHERE ID = ?;`;
    database.query(sql,
        [req.body.username, req.body.email, req.body.password, req.body.isAdmin,
            req.body.id
        ],
        (error, results) => {
            if (error) console.log(error);
            sql = `UPDATE bby_01_profile
                    SET displayName = ?
                    WHERE userID = ?`
            database.query(sql, [req.body.displayname, req.body.id], (error, results) => {
                if (error) throw error;
                res.send({
                    status: "success",
                    msg: "Record updated."
                });
                res.end();
            });
        });
});

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

app.get('/story-comment', (req, res) => {
    // If the user is logged in
    if (req.session.loggedin) {
        // Render login template
        let doc = fs.readFileSync('./story_comment.html', "utf-8");
        let profileDOM = new JSDOM(doc);
        if (req.session.isAdmin == 0) {
            profileDOM.window.document.getElementById("dashboard").remove();
        }
        let sql = `SELECT * FROM BBY_01_timeline
                    INNER JOIN bbY_01_profile
                    ON BBY_01_timeline.userID = bby_01_profile.userID
                    WHERE bby_01_timeline.postID = ?`;
        database.query(sql, [req.session.postID], (error, results) => {
            if (error) throw error;
            let date = results[0].date.toISOString().slice(0, 19).replace('T', ' ');
            profileDOM.window.document.getElementById("author").innerHTML = results[0].displayName;
            profileDOM.window.document.getElementById("postTime").innerHTML = date;
            profileDOM.window.document.getElementById("postTitle").innerHTML = results[0].title;
            profileDOM.window.document.getElementById("postText").innerHTML = results[0].story;
            profileDOM.window.document.getElementById("postPic").setAttribute("src", "/img/" + results[0].profilePic);
            
            profileDOM.window.document.getElementById("reader").setAttribute("value", req.session.userid);
            profileDOM.window.document.getElementById("reader").setAttribute("class", req.session.isAdmin);
            if (results[0].userID != req.session.userid && req.session.isAdmin == 0) {
                profileDOM.window.document.getElementById("deletePost").remove();
                profileDOM.window.document.getElementById("editPost").remove();
            } else {
                profileDOM.window.document.getElementById("deletePost").setAttribute("onclick", `deletePost(${req.session.postID})`);
                profileDOM.window.document.getElementById("editPost").setAttribute("onclick", `editPost(${req.session.postID})`);
            }
            sql = `SELECT * FROM bby_01_profile WHERE userID = ?`;
            database.query(sql, [req.session.userid], (error, results) => {
                if (error) throw error;
                profileDOM.window.document.getElementById("reader").innerHTML = results[0].displayName;
                res.send(profileDOM.serialize());
                res.end();
            })
            
        })

    } else {
        res.redirect("/");
    }

});

app.get('/get-posts', (req, res) => {
    // If the user is logged in
    if (req.session.loggedin) {
        let sql = `SELECT * FROM BBY_01_timeline
                    INNER JOIN bby_01_profile
                    ON BBY_01_timeline.userID = bby_01_profile.userID`;
        database.query(sql, (error, results) => {
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

app.post('/post-story', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    let title = req.body.title;
    let story = req.body.story;
    let date = req.body.date;
    let user = req.session.userid;

    if (title != '' && story != '') {
        database.query('INSERT INTO BBY_01_timeline (userID, title, story, date) values(?, ?, ?, ?)',
            [user, title, story, date],
            (error, results, fields) => {
                if (error) console.log(error);
                res.send({
                    status: "success",
                    msg: "Record added."
                });
            });
    }
});

app.post('/edit-post', (req, res) => {
    if (req.session.loggedin) {
        let sql = `UPDATE BBY_01_timeline SET story = ? WHERE postID = ?`;
        database.query(sql, [req.body.story, req.body.postID], (error, results) => {
            if (error) throw error;
            res.send();
            res.end();
        })
    } else {
        res.redirect("/");
    }
});

app.post('/delete-post', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    let sql = `DELETE FROM BBY_01_timeline WHERE postID = ?`;
    database.query(sql, [req.body.postID], (error, results) => {
        if(error) throw error;
        res.send();
        res.end();
    })
});

app.post('/upload-timeline-image', upload.array("files"), (req, res) => {
    var sql = `SELECT * FROM bby_01_timeline
                ORDER BY postID DESC LIMIT 1`;
    database.query(sql, (error, results) => {
        if (error) {
            console.log(error);
        } else {
            sql = `UPDATE bby_01_timeline
            SET storyPic = ?
            WHERE postID = ?`;
            database.query(sql, [req.files[0].filename, results[0].postID], (error, results) => {
                if (error) console.log(error);
                res.send({
                    status: "success",
                    rows: results
                });
            });
        }
    });
});

app.get('/get-comment', (req, res) => {
    if (req.session.loggedin) {
        let sql = `SELECT * FROM bby_01_comment
                    INNER JOIN bby_01_profile
                    ON bby_01_comment.userID = bby_01_profile.userID
                    WHERE bby_01_comment.postID = ?`;
        database.query(sql, [req.session.postID], (error, results) => {
            if (error) console.log(error);
            res.send({
                status: "success",
                rows: results
            });
            res.end();
        });
    } else {
        res.redirect("/");
    }
});

app.post('/story-comment', (req, res) => {
    if (req.session.loggedin) {
        req.session.postID = req.body.postID;
        res.send();
        res.end();
    } else {
        res.redirect("/");
    }
});

app.post('/comment', (req, res) => {
    if (req.session.loggedin) {
        let sql = `INSERT INTO bby_01_comment (postID, userID, comment, date)
                        VALUES (?, ?, ?, ?)`
        let date = new Date().toISOString().slice(0, 19).replace('T', ' ');
        database.query(sql, [req.session.postID, req.session.userid, req.body.comment, date], (error, results) => {
            if (error) throw error;
            res.send({
                status: "success",
                msg: "Record added."
            });
            res.end();
        });

    } else {
        res.redirect("/");
    }
});

app.post('/delete-comment', (req, res) => {
    if (req.session.loggedin) {
        let sql = `SELECT * FROM BBY_01_comment WHERE commentID = ?`;
        database.query(sql, [req.body.commentID], (error, results) => {
            if (error) throw error;
            if (results[0].userID == req.session.userid || req.session.isAdmin == 1) {
                sql = `DELETE FROM BBY_01_COMMENT WHERE commentID = ?`;
                database.query(sql, [req.body.commentID], (error, results) => {
                    if (error) throw error;
                    res.send({
                        status: "success",
                        msg: "Comment deleted."
                    });
                })
            } else {
                res.send({
                    status: "fail",
                    msg: "No authority to delete or edit this comment."
                });
                res.end();
            }
        });
    } else {
        res.redirect("/");
    }
});

app.post('/edit-comment', (req,res) => {
    if (req.session.loggedin) {
        
        let sql = `UPDATE BBY_01_comment SET comment = ? WHERE commentID = ?`;
        database.query(sql, [req.body.comment, req.body.commentID], (error, results) => {
            if (error) throw error;
            res.send();
            res.end();
        })
    } else {
        res.redirect("/");
    }
});

app.get('/profile', (req, res) => {
    // If the user is logged in
    if (req.session.loggedin) {
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

app.get('/get-displayname', (req, res) => {
    // If the user is loggedin
    if (req.session.loggedin) {

        const sql = `SELECT * 
                FROM bby_01_profile 
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
                FROM bby_01_profile 
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

    const sql = `UPDATE bby_01_profile
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



app.get('/get-profilePic', (req, res) => {
    if (req.session.loggedin) {

        const sql = `SELECT *
                    FROM bby_01_profile
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



app.post('/update-profile', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    let newName = req.body.displayName;
    let newAbout = req.body.about;
    let newEmail = req.body.email;
    let newPassword = req.body.password;
    let sql;
    let message = "Profile updated.";

    if (newAbout != '') {
        sql = `UPDATE bby_01_profile
                SET about = ?
                WHERE userID = ?`;
        database.query(sql, [newAbout, req.session.userid],
            (error, results, fields) => {
                if (error) console.log(error);
                message = "About updated."
            });
    }
    if (newName != '') {
        sql = `UPDATE bby_01_profile
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
    if (is_heroku) {
        connection = mysql.createConnection(dbConfigHeroku); // Recreate the connection, since
        // the old one cannot be reused.

        connection.connect(function (err) { // The server is either down
            if (err) { // or restarting (takes a while sometimes).
                console.log('error when connecting to db:', err);
                setTimeout(handleDisconnect, 2000);
            }
        });
        connection.on('error', function (err) {
            if (err.code === 'PROTOCOL_CONNECTION_LOST') {
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