const upLoadForm = document.getElementById("upload-images-form");
upLoadForm.addEventListener("submit", uploadImages);

function uploadImages(e) {
    e.preventDefault();

    const imageUpload = document.querySelector('#image-upload');
    const formData = new FormData();

    for (let i = 0; i < imageUpload.files.length; i++) {
        formData.append("files", imageUpload.files[i]);
    }

    const options = {
        method: 'POST',
        body: formData,
    };
    fetch("/upload-images", options
    ).then(function (res) {
        console.log(res);
    }).catch(function (err) { ("Error:", err) }
    );
}



// Update profile when save button is clicked
document.getElementById("updateSave").addEventListener("click", function (e) {
    e.preventDefault();
    let formData = {
        displayName: document.getElementById("displayName").value,
        about: document.getElementById("about").value,
    };
    document.getElementById("displayName").value = "";
    document.getElementById("about").value = "";

    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (this.readyState == XMLHttpRequest.DONE) {

            // 200 means everthing worked
            if (xhr.status === 200) {

                console.log("DB updated");
                window.location.assign("/profile");

            } else {

                // not a 200, could be anything (404, 500, etc.)
                console.log(this.status);

            }

        } else {
            console.log("ERROR", this.status);
        }
    }
    xhr.open("POST", "/update-profile");
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send("displayName=" + formData.displayName + "&about=" + formData.about);

})