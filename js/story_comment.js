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

function displayComment() {
    const xhr = new XMLHttpRequest();
    var parent = document.getElementById("cmtSection");
    var commentTemplate = document.getElementById("commentTemplate");
    xhr.onload = function () {
        if (this.readyState == XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                let data = JSON.parse(this.responseText);
                if (data.status == "success") {

                    for (let i = data.rows.length - 1; i >= 0; i--) {
                        let row = data.rows[i];
                        var newCommentTemplate = commentTemplate.content.cloneNode(true);
                        let displayName = row.displayName;
                        let text = row.comment;
                        let time = row.date;
                        newCommentTemplate.getElementById("commenter").innerHTML = displayName;
                        newCommentTemplate.getElementById("commentTime").innerHTML = time;
                        newCommentTemplate.getElementById("commentText").innerHTML = text;
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