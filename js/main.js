"use strict";
function displayPosts() {
    const xhr = new XMLHttpRequest();
    var parent = document.getElementById("postList");
    var postTemplate = document.getElementById("postTemplate");
    xhr.onload = function () {
        if (this.readyState == XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                let data = JSON.parse(this.responseText);
                if (data.status == "success") {
                    for (let i = data.rows.length - 1; i >= 0; i--) {
                        let row = data.rows[i];
                        var newPostTemplate = postTemplate.content.cloneNode(true);
                        let displayName = row.displayName;
                        let title = row.title;
                        let time = row.date.slice(0, 19).replace('T', ' ');
                        newPostTemplate.getElementById("author").innerHTML = displayName;
                        newPostTemplate.getElementById("postTime").innerHTML = time;
                        newPostTemplate.getElementById("postTitle").innerHTML = `<p onclick = "sendPostId(` 
                                                                                + row.postID + `)">` 
                                                                                + title + `</p>`;
                        newPostTemplate.getElementById("posterPic").src = "/img/" + row.profilePic;
                        parent.appendChild(newPostTemplate);
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
    xhr.open("GET", "/get-posts");
    xhr.send();
}

function sendPostId(postID){
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (this.readyState == XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                window.location.replace("/story-comment");
            } else {
                console.log(this.status);
            }
        } else {
            console.log("ERROR", this.status);
        }
    }
    xhr.open("POST", "/story-comment");
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send("postID=" + postID);
}

// Logout Modal Functions
var modal = document.getElementById('simpleModal');
var modalBtn = document.getElementById('logout');
var modalBtn2 = document.getElementById('logout2');
var goBack = document.getElementById('modal-return');

modalBtn.addEventListener('click', showModal);
modalBtn2.addEventListener('click', showModal);
goBack.addEventListener('click', function(e) {
    e.preventDefault();
    modal.style.display = 'none';
});
window.addEventListener('click', function(e) {
    if (e.target == modal) {
        modal.style.display = 'none';
    }
});

function showModal() {
    modal.style.display = 'block';
}


