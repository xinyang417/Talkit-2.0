

document.getElementById("post").addEventListener("click", function (e) {
    e.preventDefault();
    var dateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    let formData = {
        title: document.getElementById("title").value,
        story: document.getElementById("story").value,
        date: dateTime
    };
    document.getElementById("title").value = "";
    document.getElementById("story").value = "";
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
    let queryString = "&title=" + formData.title + "&story=" + formData.story + "&date=" + formData.date;
    xhr.open("POST", "/post-story");
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(queryString);
});