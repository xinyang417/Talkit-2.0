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
                        let currentTime = row.date;
                        newPostTemplate.getElementById("author").innerHTML = displayName;
                        newPostTemplate.getElementById("postTime").innerHTML = currentTime;
                        newPostTemplate.getElementById("postTitle").innerHTML = `<p onclick = "sendPostId(` 
                                                                                + row.postID + `)">` 
                                                                                + title + `</p>`;
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
