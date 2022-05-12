function displayName() {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (this.readyState == XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                let data = JSON.parse(this.responseText);
                if (data.status == "success") {
                    let row = data.rows[0];
                    let name = "<tr><th>" + row.displayName + "</th></tr>";
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
                if (data.status == "success") {
                    let row = data.rows[0];
                    let name = "<p>" + row.about + "</p>";
                    document.getElementById("about").innerHTML = name;
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