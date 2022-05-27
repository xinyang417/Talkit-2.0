"use strict";
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

ready(function () {
    function ajaxPOST(url, callback, data) {
        let params = typeof data == 'string' ? data : Object.keys(data).map(
            function (k) {
                return encodeURIComponent(k) + '=' + encodeURIComponent(data[k])
            }
        ).join('&');
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
            if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
                callback(this.responseText);
            } else {
                console.log(this.status);
            }
        }
        xhr.open("POST", url);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send(params);
    }

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

        let queryString = "username=" + formData.username + "&email=" + formData.email + "&password=" +
            formData.password + "&isAdmin=" + formData.isAdmin;
        // let signup = false;
        ajaxPOST("/check-account", function (data) {
            if (data) {
                let dataParsed = JSON.parse(data);

                if (dataParsed.status == "email existed") {
                    document.getElementById("errorMsg").innerHTML = dataParsed.msg;
                } else if (dataParsed.status == "invalid username") {
                    document.getElementById("errorMsg").innerHTML = dataParsed.msg;
                } else if (dataParsed.status == "empty") {
                    document.getElementById("errorMsg").innerHTML = dataParsed.msg;
                } else if (dataParsed.status == "invalid email") {
                    document.getElementById("errorMsg").innerHTML = dataParsed.msg;
                } else {
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
                }
            }
        }, queryString);
    });
})

function ready(callback) {
    if (document.readyState != "loading") {
        callback();
    } else {
        document.addEventListener("DOMContentLoaded", callback);
    }
}