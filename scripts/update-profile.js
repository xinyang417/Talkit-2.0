
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const fs = require("fs");
const multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "./app/images/")
    },
    filename: function(req, file, callback) {
        callback(null, "my-app-" + file.originalname.split('/').pop().trim());
    }
});
const upload = multer({ storage: storage });

// for the favicon and any other images
app.use("/img", express.static("./images"));


app.get('/', function (req, res) {
    let doc = fs.readFileSync('./app/html/upload-profile.html', "utf8");

    res.set('Server', 'Wazubi Engine');
    res.set('X-Powered-By', 'Wazubi');
    res.send(doc);

});

app.post('/upload-images', upload.array("files"), function (req, res) {

    //console.log(req.body);
    console.log(req.files);

    for(let i = 0; i < req.files.length; i++) {
        req.files[i].filename = req.files[i].originalname;
    }

});

// RUN SERVER
let port = 8000;
app.listen(port, function () {
    console.log('Listening on port ' + port + '!');
});
