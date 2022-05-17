  function displayPosts() {
      const xhr = new XMLHttpRequest();
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
                          let currentTime = Date(); // delete 
                          newPostTemplate.getElementById("author").innerHTML = displayName;
                          newPostTemplate.getElementById("postTime").innerHTML = currentTime;
                          newPostTemplate.getElementById("postTitle").innerHTML = title;
                          document.body.appendChild(newPostTemplate);
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