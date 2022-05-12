function getUsers() {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (this.readyState == XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                let data = JSON.parse(this.responseText);
                if (data.status == "success") {
                    let str = `<tr>
                                    <th class ="userid_header"><span>ID</span></th>
                                    <th class ="username_header"><span>Name</span></th>
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
                        "td.email span, td.usernames span, td.password span, td.admin span");
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
        let s = null;
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
                    isAdmin: parent.parentNode.querySelector(".admin span")
                };
            } else if (parent == name) {
                dataToSend = {
                    id: parent.parentNode.querySelector(".id").innerHTML,
                    username: v,
                    email: parent.parentNode.querySelector(".email span").innerHTML,
                    password: parent.parentNode.querySelector(".password span").innerHTML,
                    isAdmin: parent.parentNode.querySelector(".admin span")
                };
            } else if (parent == password) {
                dataToSend = {
                    id: parent.parentNode.querySelector(".id").innerHTML,
                    username: parent.parentNode.querySelector(".usernames span").innerHTML,
                    email: parent.parentNode.querySelector(".email span").innerHTML,
                    password: v,
                    isAdmin: parent.parentNode.querySelector(".admin span")
                };
            } else if (parent == isAdmin) {
                dataToSend = {
                    id: parent.parentNode.querySelector(".id").innerHTML,
                    username: parent.parentNode.querySelector(".usernames span").innerHTML,
                    email: parent.parentNode.querySelector(".email span").innerHTML,
                    password: parent.parentNode.querySelector(".password span").innerHTML,
                    isAdmin: v
                };
            }
            const xhr = new XMLHttpRequest();
            xhr.onload = function () {
                if (this.readyState == XMLHttpRequest.DONE) {
                    if (xhr.status === 200) {
                        let data = xhr.responseText;
                        let jsonResponse = JSON.parse(data);
                        document.getElementById("status").innerHTML = jsonResponse["msg"];
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
            xhr.send("id=" + dataToSend.id + "&username=" + dataToSend.username + "&email=" + dataToSend.email +
                "&password=" + dataToSend.password + "&isAdmin=" + dataToSend.isAdmin);
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

    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (this.readyState == XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                getUsers();
                let data = xhr.responseText;
                let jsonResponse = JSON.parse(data);
                document.getElementById("status").innerHTML = jsonResponse["msg"];
            } else {
                console.log(this.status);
            }
        } else {
            console.log("ERROR", this.status);
        }
    }
    xhr.open("POST", "/add-user");
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send("username=" + formData.username + "&email=" + formData.email + "&password=" + formData.password +
        "&isAdmin=" + formData.isAdmin);
})

document.getElementById("delete").addEventListener("click", (e) => {
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