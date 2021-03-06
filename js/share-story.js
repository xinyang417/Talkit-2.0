"use strict";

function getDisplayName() {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (this.readyState == XMLHttpRequest.DONE){
            if (xhr.status === 200) {
                let data = JSON.parse(this.responseText);
                if (data.status == "success") {
                    let dName = data.rows[0].displayName
                    document.getElementById("displayName").innerHTML = dName;
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
    xhr.open("GET", "/get-profile");
    xhr.send();
}
getDisplayName();

document.getElementById("post").addEventListener("click", function (e) {
    e.preventDefault();

    let formData = {
        title: document.getElementById("title").value,
        story: document.getElementById("story").value,
    };
    document.getElementById("title").value = "";
    document.getElementById("story").value = "";
    if (formData.title.length <= 0 || formData.title.trim().length <= 0 
    || formData.story.length <= 0 || formData.story.trim().length <= 0) {
        return;
    }
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (this.readyState == XMLHttpRequest.DONE) {

            // 200 means everthing worked
            if (xhr.status === 200) {
                window.location.assign("/home");

            } else {
                // not a 200
                console.log(this.status);
            }

        } else {
            console.log("ERROR", this.status);
        }
    }
    let queryString = "title=" + formData.title + "&story=" + formData.story;
    xhr.open("POST", "/post-story");
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(queryString);
    uploadImages();
});

function uploadImages() {
    const imageUpload = document.querySelector('#inputPhoto');
    const formData = new FormData();
    if (imageUpload.files.length > 0) {

        for (let i = 0; i < imageUpload.files.length; i++) {
            formData.append("files", imageUpload.files[i]);
        }
        const options = {
            method: 'POST',
            body: formData,
        };
        fetch("/upload-timeline-image", options).catch(function (err) {
            ("Error:", err)
        });
    }
}

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

// Discard Modal Functions
var discardModal = document.getElementById('simpleModal2');
var discardModalBtn = document.getElementById('discard');
var goBack = document.getElementById('modal-return-cancel');


discardModalBtn.addEventListener('click', function () {
    discardModal.style.display = 'block';
});

goBack.addEventListener('click', function (e) {
    e.preventDefault();
    discardModal.style.display = 'none';
});

window.addEventListener('click', function (e) {
    if (e.target == discardModal) {
        discardModal.style.display = 'none';
    }
});

var discardModal2 = document.getElementsByClassName('discardModal');

for (var i = 0; i < discardModal2.length; i++) {
    discardModal2[i].setAttribute("onclick", `pageRedirect('/${discardModal2[i].getAttribute("data-id")}')`)
}

function pageRedirect(v) {
    document.getElementById("discard-modal-form").setAttribute("action", v);
    discardModal.style.display = 'block';
}


