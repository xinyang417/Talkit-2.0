"use strict";

const emailVal = (email) => {
    return String(email).toLowerCase().match( /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

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

function getUsers() {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (this.readyState == XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                let data = JSON.parse(this.responseText);
                if (data.status == "success") {
                    let str = `<tr>
                                    <th class ="userid_header"><span>ID</span></th>
                                    <th class ="username_header"><span>Username</span></th>
                                    <th class ="email_header"><span>Email</span></th>
                                    <th class ="password_header"><span>Password</span></th>
                                    <th class ="admin_header"><span>isAdmin</span></th>
                                </tr>`;
                    for (let i = 0; i < data.rows.length; i++) {
                        let row = data.rows[i];
                        str += ("<tr><td class = 'id'>" + row.ID +
                            "</td><td class = 'usernames'><span>" + row.username +
                            "</span></td><td class = 'email'><span>" + row.email +
                            "</span></td><td class = 'password'><span>" + row.password +
                            "</span></td><td class = 'admin'><span>" + row.isAdmin +
                            "</span></td></tr>");
                    }
                    document.getElementById("users").innerHTML = str;

                    let records = document.querySelectorAll(
                        "td.email span, td.displayName span, td.usernames span, td.password span, td.admin span");
                    for (let j = 0; j < records.length; j++) {
                        records[j].addEventListener("click", edit);
                    }
                } else {
                    console.log("Error!");
                }
            } else {
                console.log(this.status);
            }
        } else {
            console.log("Error", this.status);
        }
    }
    xhr.open("GET", "/get-users");
    xhr.send();
}

getUsers();

function setDefaultDisplayName(email) {

    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (this.readyState == XMLHttpRequest.DONE) {
            if (xhr.status === 200) {} else {
                console.log(this.status);
            }
        } else {
            console.log("ERROR", this.status);
        }
    }
    xhr.open("POST", "/set-default-displayName");
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send("email=" + email);
}

function edit(e) {
    let spanText = e.target.innerHTML;
    let parent = e.target.parentNode;
    let password = parent.parentNode.querySelector(".password");
    let email = parent.parentNode.querySelector(".email");
    let name = parent.parentNode.querySelector(".usernames");
    let isAdmin = parent.parentNode.querySelector(".admin");
    let input = document.createElement("input");
    input.value = spanText;
    input.addEventListener("keyup", function (e) {
        let v = null;
        if (e.which == 13) {
            v = input.value;
            let newSpan = document.createElement("span");
            newSpan.addEventListener("click", edit);
            newSpan.innerHTML = v;
            parent.innerHTML = "";
            parent.appendChild(newSpan);
            let dataToSend;

            if (parent == email) {
                dataToSend = {
                    id: parent.parentNode.querySelector(".id").innerHTML,
                    username: parent.parentNode.querySelector(".usernames span").innerHTML,
                    email: v,
                    password: parent.parentNode.querySelector(".password span").innerHTML,
                    isAdmin: parent.parentNode.querySelector(".admin span").innerHTML,
                    change: "email"
                };
            } else if (parent == name) {
                dataToSend = {
                    id: parent.parentNode.querySelector(".id").innerHTML,
                    username: v,
                    email: parent.parentNode.querySelector(".email span").innerHTML,
                    password: parent.parentNode.querySelector(".password span").innerHTML,
                    isAdmin: parent.parentNode.querySelector(".admin span").innerHTML,
                    change: "username"
                };
            } else if (parent == password) {
                dataToSend = {
                    id: parent.parentNode.querySelector(".id").innerHTML,
                    username: parent.parentNode.querySelector(".usernames span").innerHTML,
                    email: parent.parentNode.querySelector(".email span").innerHTML,
                    password: v,
                    isAdmin: parent.parentNode.querySelector(".admin span").innerHTML,
                    change: "password"
                };
            } else if (parent == isAdmin) {
                dataToSend = {
                    id: parent.parentNode.querySelector(".id").innerHTML,
                    username: parent.parentNode.querySelector(".usernames span").innerHTML,
                    email: parent.parentNode.querySelector(".email span").innerHTML,
                    password: parent.parentNode.querySelector(".password span").innerHTML,
                    isAdmin: v,
                    change: "isAdmin"
                };
            }
            if (!v || v.trim().length == 0) {
                document.getElementById("status").innerHTML = "Please fill in the fields.";
                document.getElementById('status').style.color = "red";
                getUsers();
                return;
            }
            if (dataToSend.isAdmin != 0 && dataToSend.isAdmin != 1) {
                document.getElementById('status').innerHTML = "Please enter 0 for regular account and 1 for admin account.";
                document.getElementById('status').style.color = "red";
                getUsers();
                return;
            }
            if(!emailVal(dataToSend.email)) {
                document.getElementById("status").innerHTML = `Please include '@' in the email address.<br/> '${dataToSend.email}' is missing '@'.`;
                document.getElementById('status').style.color = "red";
                getUsers();
                return;
            }
            const xhr = new XMLHttpRequest();
            xhr.onload = function () {
                if (this.readyState == XMLHttpRequest.DONE) {
                    if (xhr.status === 200) {
                        let data = xhr.responseText;
                        let jsonResponse = JSON.parse(data);
                        document.getElementById("status").innerHTML = jsonResponse["msg"];
                        if (jsonResponse.status == 'fail') {
                            document.getElementById("status").style.color = "red";
                        } else {
                            document.getElementById("status").style.color = "green";
                        }
                        getUsers();
                    } else {
                        console.log(this.status);
                    }
                } else {
                    console.log("ERROR", this.status);
                }
            }
            xhr.open("POST", "/update-user");
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xhr.send("id=" + dataToSend.id +
                "&username=" + dataToSend.username +
                "&email=" + dataToSend.email +
                "&password=" + dataToSend.password +
                "&isAdmin=" + dataToSend.isAdmin +
                "&change=" + dataToSend.change);
        }
    });
    parent.innerHTML = "";
    parent.appendChild(input);
}

document.getElementById("add").addEventListener("click", (e) => {
    e.preventDefault();
    let formData = {
        username: document.getElementById("username").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
        isAdmin: document.getElementById("isAdmin").value
    };
    document.getElementById("username").value = "";
    document.getElementById("email").value = "";
    document.getElementById("password").value = "";
    document.getElementById("isAdmin").value = "";
    let queryString = "username=" + formData.username + "&email=" + formData.email + "&password=" +
        formData.password + "&isAdmin=" + formData.isAdmin;
    ajaxPOST("/check-account", function (data) {
        if (data) {
            let dataParsed = JSON.parse(data);
            let dataStatus = ["email existed", 'invalid username', 'invalid admin code', 'empty', 'invalid email'];
            if (dataStatus.includes(dataParsed.status)) {
                document.getElementById("status").innerHTML = dataParsed.msg;
                document.getElementById("status").style.color = "red";
            } else {
                document.getElementById("status").style.color = "green";
                const xhr = new XMLHttpRequest();
                xhr.onload = function () {
                    if (this.readyState == XMLHttpRequest.DONE) {
                        // 200 means everthing worked
                        if (xhr.status === 200) {
                            let data = xhr.responseText;
                            let jsonResponse = JSON.parse(data);
                            document.getElementById("status").innerHTML = jsonResponse["msg"];
                            getUsers();
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
})

document.getElementById("modal-succuess-delete-user").addEventListener("click", (e) => {
    e.preventDefault();
    let formData = {
        id: document.getElementById("deleteID").value,
    }
    document.getElementById("deleteID").value = "";

    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (this.readyState == XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                getUsers();
                let data = xhr.responseText;
                let jsonResponse = JSON.parse(data);
                document.getElementById("status").innerHTML = jsonResponse["msg"];
                var deleteUserModal = document.getElementById('simpleModal2');
                if (jsonResponse.status == 'fail') {
                    document.getElementById("status").style.color = "red";
                } else {
                    document.getElementById("status").style.color = "green";
                }
                deleteUserModal.style.display = 'none';
            } else {
                console.log(this.status);
            }
        } else {
            console.log("ERROR", this.status);
        }
    }
    xhr.open("POST", "/delete-user");
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send("id=" + formData.id);
})

// Logout Modal Functions
var modal = document.getElementById('simpleModal');
var modalBtn = document.getElementById('logout');
var goBack = document.getElementById('modal-return');

modalBtn.addEventListener('click', function () {
    modal.style.display = 'block';
});

goBack.addEventListener('click', function (e) {
    e.preventDefault();
    modal.style.display = 'none';
});
window.addEventListener('click', function (e) {
    if (e.target == modal) {
        modal.style.display = 'none';
    }
});

// Delete User Modal Functions
var deleteUserModal = document.getElementById('simpleModal2');
var deleteUserBtn = document.getElementById('delete');
var goBack = document.getElementById('modal-return-delete-user');

deleteUserBtn.addEventListener('click', function () {
    deleteUserModal.style.display = 'block';
});

goBack.addEventListener('click', function (e) {
    e.preventDefault();
    deleteUserModal.style.display = 'none';
});

window.addEventListener('click', function (e) {
    if (e.target == deleteUserModal) {
        deleteUserModal.style.display = 'none';
    }
});