const express = require('express');
const app = express();
const fs = require("fs");
const mysql = require('mysql2');
const multer = require("multer");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/img", express.static("../images"));
app.use("/css", express.static("../styles"));

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "../images/")
    },
    filename: function (req, file, callback) {
        callback(null, "my-app-" + file.originalname.split('/').pop().trim());
    }
});
const upload = multer({ storage: storage });

app.post('/upload-images', upload.array("files"), function (req, res) {

    //console.log(req.body);
    console.log(req.files);

    for (let i = 0; i < req.files.length; i++) {
        req.files[i].filename = req.files[i].originalname;
    }

});


// for the favicon and any other images

app.get('/', function (req, res) {
    // Build the DB 
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        multipleStatements: true
    });

    const sql = `CREATE DATABASE IF NOT EXISTS talkit;
        use talkit;
        CREATE TABLE IF NOT EXISTS profile (
        ID int NOT NULL AUTO_INCREMENT,
        displayName varchar(30),
        about varchar(500),
        PRIMARY KEY (ID));`;
        // FOREIGN KEY (ID) REFERENCES user(ID)
    connection.connect();
    connection.query(sql, function (error, results, fields) {
        if (error) {
            console.log(error);
        }
        console.log(results);

    });
    connection.end();

    let doc = fs.readFileSync('../profile.html', "utf8");
    res.send(doc);
});

app.get('/update-profile', (req, res) => {
    let doc =fs.readFileSync('../update-profile.html', "utf-8");
    res.send(doc);
})

app.get('/get-displayname', (req,res) => {
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'talkit'
    });
    connection.connect();
    connection.query('SELECT displayName FROM profile WHERE ID = 1',(error, results) =>{
        if (error) console.log(error);
        console.log('Name=', results);
        res.send({ status: "success", rows: results});
    });
    connection.end();
})

// app.get('/', function (req, res) {
//     let doc = fs.readFileSync('../update-profile.html', "utf8");

//     res.set('Server', 'Wazubi Engine');
//     res.set('X-Powered-By', 'Wazubi');
//     res.send(doc);

// });




// Update user profile information



// app.use(express.json());
// app.use(express.urlencoded({
//     extended: true
// }));




// Notice that this is a 'POST'
app.post('/add-profile', function (req, res) {
    res.setHeader('Content-Type', 'application/json');

    console.log("displayName", req.body.displayName);
    console.log("about", req.body.about);

    let connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'talkit'
    });
    connection.connect();
    // TO PREVENT SQL INJECTION, DO THIS:
    connection.query('INSERT INTO profile (displayName, about) values (?, ?)',
        [req.body.displayName, req.body.about],
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
    console.log('Listening on port ' + port + '!');
});

