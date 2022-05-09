"use strict";
document.getElementById("submit").addEventListener("click", function (e) {
    e.preventDefault();

    let formData = {
        username: document.getElementById("username").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
        isAdmin: 0
    };
    document.getElementById("username").value = "";
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
    xhr.open("POST", "/add-user");
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send("username=" + formData.username + "&email=" + formData.email + "&password=" + formData
        .password + "&isAdmin=" + formData.isAdmin);
})