"use strict";
const upLoadForm = document.getElementById("upload-images-form");
// upLoadForm.addEventListener("image-upload", uploadImages);

function uploadImages(e) {
    e.preventDefault();
    const imageUpload = document.querySelector('#image-upload');
    const formData = new FormData();

    for (let i = 0; i < imageUpload.files.length; i++) {
        formData.append("files", imageUpload.files[i]);
    }

    const options = {
        method: 'POST',
        body: formData,
    };
    fetch("/upload-images", options).catch(function (err) {
        ("Error:", err)
    });
}

document.getElementById("image-upload").onchange = (e) => {
    document.getElementById("profilePic").src = URL.createObjectURL(e.target.files[0]);
}

document.getElementById("delete").addEventListener("click", () => {
    document.getElementById("profilePic").src = "/img/logo-04.png";
})

const togglePassword = document.querySelector("#togglePassword");
const password = document.querySelector("#password");

togglePassword.addEventListener("click", function () {

    const type = password.getAttribute("type") === "password" ? "text" : "password";
    password.setAttribute("type", type);

    this.classList.toggle("bi-eye");
});

const form = document.querySelector("form");
form.addEventListener('submit', function (e) {
    e.preventDefault();
});


// Update profile when save button is clicked
document.getElementById("updateSave").addEventListener("click", function (e) {
    e.preventDefault();
    let formData = {
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
        displayName: document.getElementById("displayName").value,
        about: document.getElementById("about").value
    };
    document.getElementById("displayName").value = "";
    document.getElementById("about").value = "";
    document.getElementById("email").value = "";
    document.getElementById("password").value = "";
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (this.readyState == XMLHttpRequest.DONE) {

            // 200 means everthing worked
            if (xhr.status === 200) {
                window.location.assign("/profile");
            } else {

                // not a 200, could be anything (404, 500, etc.)
                console.log(this.status);

            }

        } else {
            console.log("ERROR", this.status);
        }
    }
    let queryString = "displayName=" + formData.displayName + "&about=" + formData.about + "&email=" + formData.email + "&password=" + formData.password;
    xhr.open("POST", "/update-profile");
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(queryString);
    uploadImages(e);
});

document.getElementById("updateCancel").addEventListener("click", (e) => {
    e.preventDefault();
    window.location.assign("/profile");
})

function displayUsername() {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (this.readyState == XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                let data = JSON.parse(this.responseText);
                if (data.status == "success") {
                    let row = data.rows[0];
                    document.getElementById("username").setAttribute("value", row.username);
                } else {
                    console.log("Error!");
                }
            } else {
                console.log(this.status);
            }
        } else {
            console.log("ERROR", this.status);
        }
    }
    xhr.open("GET", "/get-username");
    xhr.send();
}
displayUsername();

function displayName() {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (this.readyState == XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                let data = JSON.parse(this.responseText);
                if (data.status == "success" && data.rows.length > 0) {
                    let row = data.rows[0];
                    let name = row.displayName;
                    let about = row.about;
                    document.getElementById("displayName").setAttribute("value", name);
                    document.getElementById("about").innerHTML = about;
                } else {
                    console.log("Error!");
                }
            } else {
                console.log(this.stauts);
            }
        } else {
            console.log("ERROR", this.status);
        }
    }
    xhr.open("GET", "/get-displayname");
    xhr.send();
}

displayName();


// Logout Modal Functions
var modal = document.getElementById('simpleModal');
var modalBtn = document.getElementById('logout');
var goBack = document.getElementById('modal-return');

modalBtn.addEventListener('click', function () {
    modal.style.display = 'block';
});
goBack.addEventListener('click', function(e) {
    e.preventDefault();
    modal.style.display = 'none';
});
window.addEventListener('click', function (e) {
    if (e.target == modal) {
        modal.style.display = 'none';
    }
});

