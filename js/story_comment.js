"use strict";

var imageInfo;


function deleteImage(postImageID) {
    var modal = document.getElementById('simpleModal4');
    var goBack = document.getElementById('modal-return-delete-image');
    var deleteCmt = document.getElementById('modal-succuess-delete-image');
    modal.style.display = 'block';
    goBack.addEventListener('click', function () {
        modal.style.display = 'none';
    });
    window.addEventListener('click', function (e) {
        if (e.target == modal) {
            modal.style.display = 'none';
        }
    });
    deleteCmt.addEventListener('click', () => {
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
        xhr.open("POST", "/delete-image");
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send("imageID=" + postImageID);
    });

}

function displayImages() {
    const xhr = new XMLHttpRequest();
    var parent = document.getElementById("slide");
    var postTemplate = document.getElementById("imageGalleryTemplate");
    xhr.onload = function () {
        if (this.readyState == XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                let data = JSON.parse(this.responseText);
                if (data.status == "success") {
                    imageInfo = data.rows;
                    for (let i = 0; i < data.rows.length; i++) {
                        let row = data.rows[i];
                        var newPostTemplate = postTemplate.content.cloneNode(true);
                        newPostTemplate.getElementById("postImage").src = "/img/" + row.storyPic;
                        newPostTemplate.getElementById("postImage").setAttribute("value", row.postImageID);
                        newPostTemplate.getElementById("postImage").setAttribute("id", "image" + row.postImageID);
                        newPostTemplate.getElementById("numbertext").innerHTML = i + 1 + " / " + data.rows.length;
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
    xhr.open("GET", "/get-post-images");
    xhr.send();
}




var coll = document.getElementsByClassName("collapsible");
var i;

for (i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", function () {
        this.classList.toggle("active");
        var content = this.nextElementSibling;
        if (content.style.maxHeight) {
            content.style.maxHeight = null;
        } else {
            content.style.maxHeight = content.scrollHeight + "px";
        }
    });
}

document.getElementById("back").addEventListener("click", (e) => {
    e.preventDefault();
    window.location.assign("/home");
})

function displayComment() {
    const xhr = new XMLHttpRequest();
    var parent = document.getElementById("cmtSection");
    var commentTemplate = document.getElementById("commentTemplate");
    xhr.onload = function () {
        if (this.readyState == XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                let data = JSON.parse(this.responseText);
                if (data.status == "success") {
                    let id = document.getElementById("reader").getAttributeNode("value").value;
                    let isAdmin = document.getElementById("reader").getAttributeNode("class").value;
                    for (let i = data.rows.length - 1; i >= 0; i--) {
                        let row = data.rows[i];
                        var newCommentTemplate = commentTemplate.content.cloneNode(true);
                        let displayName = row.displayName;
                        let text = row.comment;
                        let time = row.date.slice(0, 19).replace('T', ' ');
                        let profilePic = "/img/" + row.profilePic;
                        newCommentTemplate.getElementById("comment").setAttribute("id", row.commentID);
                        newCommentTemplate.getElementById("commenterPic").setAttribute("src", profilePic);
                        newCommentTemplate.getElementById("commenter").innerHTML = displayName;
                        newCommentTemplate.getElementById("commentTime").innerHTML = time;
                        newCommentTemplate.getElementById("commentText").innerHTML = text;
                        newCommentTemplate.getElementById("commenter").setAttribute("id", "commenter" + row.commentID);
                        newCommentTemplate.getElementById("commentTime").setAttribute("id", "commentTime" + row.commentID);
                        newCommentTemplate.getElementById("commentText").setAttribute("id", "commentText" + row.commentID);
                        if (id != row.userID && isAdmin == 0) {
                            newCommentTemplate.getElementById("cmtDelete").remove();
                            newCommentTemplate.getElementById("cmtEdit").remove();
                        } else {
                            newCommentTemplate.getElementById("cmtDelete").setAttribute("onclick", `showDeleteCmtModal(${row.commentID})`);
                            newCommentTemplate.getElementById("cmtDelete").setAttribute("id", "cmtDelete" + row.commentID);
                            newCommentTemplate.getElementById("cmtEdit").setAttribute("onclick", `editComment(${row.commentID})`);
                            newCommentTemplate.getElementById("cmtEdit").setAttribute("id", "cmtEdit" + row.commentID);
                        }

                        parent.appendChild(newCommentTemplate);
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
    xhr.open("GET", "/get-comment");
    xhr.send();
}

displayComment();

function comment() {
    let formData = {
        comment: document.getElementById("addCmtText").value,
    }
    document.getElementById("addCmtText").value = "";

    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (this.readyState == XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                displayComment();
            } else {
                console.log(this.status);
            }
        } else {
            console.log("ERROR", this.status);
        }
    }
    xhr.open("POST", "/comment");
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send("comment=" + formData.comment);
}

function deletePost(postID) {
    var modal = document.getElementById('simpleModal3');
    var goBack = document.getElementById('modal-return-delete-post');
    var deletePst = document.getElementById('modal-succuess-delete-post');
    modal.style.display = 'block';
    goBack.addEventListener('click', function (e) {
        e.preventDefault();
        modal.style.display = 'none';
    });
    window.addEventListener('click', function (e) {
        if (e.target == modal) {
            modal.style.display = 'none';
        }
    });
    deletePst.addEventListener('click', () => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
            if (this.readyState == XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    window.location.replace("/home");
                } else {
                    console.log(this.status);
                }
            } else {
                console.log("ERROR", this.status);
            }
        }
        xhr.open("POST", "/delete-post");
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send("postID=" + postID);
    });
}



function showDeleteCmtModal(commentID) {
    var modal = document.getElementById('simpleModal2');
    var goBack = document.getElementById('modal-return-delete-comment');
    var deleteCmt = document.getElementById('modal-succuess-delete-comment');
    modal.style.display = 'block';
    goBack.addEventListener('click', function () {
        modal.style.display = 'none';
    });
    window.addEventListener('click', function (e) {
        if (e.target == modal) {
            modal.style.display = 'none';
        }
    });
    deleteCmt.addEventListener('click', () => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
            if (this.readyState == XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    location.reload();
                } else {
                    console.log(this.status);
                }
            } else {
                console.log("ERROR", this.status);
            }
        }
        xhr.open("POST", "/delete-comment");
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send("commentID=" + commentID);
    });
}

function editPost(postID) {
    let postText = document.getElementById("postText");
    let parent = postText.parentNode;
    let textArea = document.createElement("textarea");
    let imgUpload = document.getElementById("inputPhoto");
    let msg = document.createElement("p");

    msg.innerHTML = "Click the images you want to delete";
    msg.setAttribute("id", "msgDelete");
    document.getElementById("slideContainer").appendChild(msg);

    textArea.value = postText.innerHTML;
    textArea.setAttribute("id", "postEditArea");
    parent.replaceChild(textArea, postText);

    let cancel = document.createElement("button");
    cancel.innerHTML = 'Cancel';
    cancel.setAttribute("id", "cancelPost");

    let submit = document.createElement("button");
    submit.innerHTML = 'Save';
    submit.setAttribute("id", "submitPost");
    imgUpload.style.display = 'block';

    let images = document.getElementsByClassName("pstImage");
    let imgIDs = [];
    for (let i = 0; i < imageInfo.length; i++) {
        let imgID = images[i].getAttribute('value');
        images[i].addEventListener("click", () => {
            imgIDs.push(imgID);
            images[i].style.border = "thick solid";
        });

    }
    
    parent.appendChild(cancel);
    parent.appendChild(submit);

    cancel.addEventListener("click", () => {
        parent.replaceChild(postText, textArea);
        parent.removeChild(cancel);
        parent.removeChild(submit);
        document.getElementById("slideContainer").removeChild(msg);
        imgUpload.style.display = 'none';
        imgUpload.value = '';
    });

    submit.addEventListener("click", () => {
        console.log(imgIDs.length);
        if (imgIDs.length > 0) {
            console.log(imgIDs.length);
            deleteImage.apply(this, imgIDs);
        } else {
            let v = textArea.value;
            let newText = document.createElement("p");
            newText.innerHTML = textArea.value;
            newText.setAttribute("id", "postText");
            parent.replaceChild(newText, textArea);
            const xhr = new XMLHttpRequest();
            xhr.onload = function () {
                if (this.readyState == XMLHttpRequest.DONE) {
                    if (xhr.status === 200) {
                        document.getElementById("slideContainer").removeChild(msg);
                        parent.removeChild(cancel);
                        parent.removeChild(submit);
                        window.location.reload();
                        imgUpload.style.display = 'none';
                        imgUpload.value = '';
                    } else {
                        console.log(this.status);
                    }
                } else {
                    console.log("ERROR", this.status);
                }
            }
            xhr.open("POST", "/edit-post");
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xhr.send("story=" + v + "&postID=" + postID);
            uploadImages(postID);
        }
    });
}

function uploadImages(postID) {
    const imageUpload = document.querySelector("#inputPhoto");
    const formData = new FormData();
    if (imageUpload.files.length > 0) {

        for (let i = 0; i < imageUpload.files.length; i++) {
            formData.append("files", imageUpload.files[i]);
        }

        const options = {
            method: 'POST',
            body: formData,
            postNum: postID,
        };
        fetch("/upload-another-timeline-image", options).catch(function (err) {
            ("Error:", err)
        });
    }
}

function editComment(commentID) {
    let commentText = document.getElementById("commentText" + commentID);
    let parent = commentText.parentNode;
    let textArea = document.createElement("textarea");

    textArea.value = commentText.innerHTML;
    textArea.setAttribute('class', 'commentEditArea');
    parent.replaceChild(textArea, commentText);

    let submit = document.createElement("button");
    submit.innerHTML = 'Save';
    submit.setAttribute("class", "editSubmit");

    let cancel = document.createElement("button");
    cancel.innerHTML = "Cancel";
    cancel.setAttribute("class", "editCancel");

    parent.appendChild(cancel);
    parent.appendChild(submit);

    cancel.addEventListener("click", () => {
        parent.replaceChild(commentText, textArea);
        parent.removeChild(cancel);
        parent.removeChild(submit);
    });
    submit.addEventListener("click", () => {
        let v = textArea.value;
        let newText = document.createElement("p");
        newText.innerHTML = textArea.value;
        newText.setAttribute("id", "commentText" + commentID);
        newText.setAttribute("class", "cmtText");
        parent.replaceChild(newText, textArea);
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
            if (this.readyState == XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    parent.removeChild(cancel);
                    parent.removeChild(submit);
                } else {
                    console.log(this.status);
                }
            } else {
                console.log("ERROR", this.status);
            }
        }
        xhr.open("POST", "/edit-comment");
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send("comment=" + v + "&commentID=" + commentID);
    });
}


// Logout Modal Functions
var modal = document.getElementById('simpleModal');
var modalBtn = document.getElementById('logout');
var goBack = document.getElementById('modal-return');

modalBtn.addEventListener('click', function() {
    modal.style.display = 'block';
});
goBack.addEventListener('click', function(e) {
    e.preventDefault();
    modal.style.display = 'none';
});
window.addEventListener('click', function(e) {
    if (e.target == modal) {
        modal.style.display = 'none';
    }
});
