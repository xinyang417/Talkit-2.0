function displayName() {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (this.readyState == XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                let data = JSON.parse(this.responseText);
                if (data.status == "success" && data.rows.length > 0) {
                    let row = data.rows[0];
                    let name = "<p>" + row.displayName + "</p>";
                    document.getElementById("dName").innerHTML = name;
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

function displayAbout() {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (this.readyState == XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                let data = JSON.parse(this.responseText);
                if (data.status == "success" && data.rows.length > 0) {
                    let row = data.rows[0];
                    let about = "<p>" + row.about + "</p>";
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
    xhr.open("GET", "/get-about");
    xhr.send();
}

displayAbout();

function displayPicture() {
    const xhr = new XMLHttpRequest();
    xhr.onload = function (){
        if (this.readyState == XMLHttpRequest.DONE){
            if (xhr.status === 200) {
                let data = JSON.parse(this.responseText);
                if (data.status == "success" && data.rows.length > 0) {
                    let row = data.rows[0];
                    document.getElementById("profilePic").setAttribute("src", "/img/" + row.profilePic);
                } else if (data.rows.length == 0) {
                    document.getElementById("profilePic").setAttribute("src", "/img/logo-04.png");
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
    xhr.open("GET", "/get-profilePic");
    xhr.send();
}

displayPicture();

function displayUsername() {
    const xhr = new XMLHttpRequest();
    xhr.onload = function (){
        if (this.readyState == XMLHttpRequest.DONE){
            if (xhr.status === 200) {
                let data = JSON.parse(this.responseText);
                if (data.status == "success") {
                    let row = data.rows[0];
                    console.log(row.username);
                    document.getElementById("uName").innerHTML = row.username;
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