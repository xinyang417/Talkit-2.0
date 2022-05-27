"use strict";

let socket = io.connect('/');
let data = JSON.parse(sessionStorage.getItem("user"));
var room;
socket.emit('loggedin', data)

function openChatWindow(room) {
    
    if (!document.getElementById(room)) {
        document.getElementById("chat-box").innerHTML = `<div class="chat-window" id="${room}"></div>`;
        document.getElementById("dchat-box").innerHTML = `<div class="chat-window" id="d${room}"></div>`;
    }
    document.getElementById("send").setAttribute("onclick", `sendMessage('${room}')`);
    document.getElementById("dsend").setAttribute("onclick", `sendMessage('${room}')`);
}
function createRoom(id, name) {
    let loggedInUser = JSON.parse(sessionStorage.getItem('user'));
    room = Date.now() + Math.random();
    room = room.toString().replace(".", "_");
    document.getElementById("friend-dName").getElementsByTagName("b")[0].innerHTML = name;
    document.getElementById("dfriend-dName").getElementsByTagName("b")[0].innerHTML = name;
    socket.emit('create', {room: room, userId: loggedInUser.ID, withUserId: id, hostName: data.displayName});
    openChatWindow(room);
}

function sendMyMessage(chatWindowId, fromUser, message) {
    let html;
    if (data.ID == fromUser.ID) {
        html =`<div class="myBubble">
                    <div class="myMsg">
                        <p class="myText">${message}</p>
                        <img class="myPic" src="${fromUser.profilePic}" />
                    </div>
                </div>`;
    } else {
        html = `<div class="userBubble"> 
                    <div class="userMsg">
                        <img class="userPic" src="${fromUser.profilePic}" />
                        <p class="userText">${message}</p>
                    </div>
                </div>`;
    }
    
    document.getElementById(`${chatWindowId}`).insertAdjacentHTML("beforeend", html);
    document.getElementById(`d${chatWindowId}`).insertAdjacentHTML("beforeend", html);  
}

function sendMessage(room) {
    let message = document.getElementById("msg").value;
    document.getElementById("msg").value = "";
    let msg = document.getElementById("dmsg").value;
    document.getElementById("dmsg").value = "";
    if(msg) {
        message = msg;
    }
    socket.emit('send-message', {room: room, message:message, from: data});
    sendMyMessage(room, data, message);
}

socket.on('updateUserList', (userList) => {
    let loggedInUser = JSON.parse(sessionStorage.getItem('user'));
    document.getElementById("inbox-component").innerHTML = `<ul></ul>`;
    document.getElementById("dinbox-component").innerHTML = `<ul></ul>`;
    let i = 0;
    userList.forEach(item => {
        if (loggedInUser.ID != item.ID){
            document.getElementById('inbox-component').getElementsByTagName("ul")[i].innerHTML = `<li data-id ="${item.ID}" onclick = "createRoom('${item.ID}', '${item.displayName}')">${item.displayName}</li>`;
            document.getElementById('dinbox-component').getElementsByTagName("ul")[i].innerHTML = `<li data-id ="${item.ID}" onclick = "createRoom('${item.ID}', '${item.displayName}')">${item.displayName}</li>`;
            i++;
        }
    });
});

socket.on('invite', function(data) {
    document.getElementById("friend-dName").getElementsByTagName("b")[0].innerHTML = `${data.hostName}`;
    document.getElementById("dfriend-dName").getElementsByTagName("b")[0].innerHTML = `${data.hostName}`;
    socket.emit("joinRoom", data)
});

socket.on('receive-message', (data) => {
    if(!document.getElementById(`${data.room}`)) {
        openChatWindow(data.room);
    }
    
    sendMyMessage(data.room, data.from, data.message)
});




    function openTab(evt, tabName) {
        // Declare all variables 
        var i, tabcontent, tablinks;
    
        // Get all elements with class="tabcontent" and hide them
        tabcontent = document.getElementsByClassName("tabcontent");
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }
    
        // Get all elements with class="tablinks" and remove the class "active"
        tablinks = document.getElementsByClassName("tablinks");
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" active", "");
        }
    
        // Show the current tab, and add an "active" class to the button that opened the tab
        document.getElementById(tabName).style.display = "block";
        evt.currentTarget.className += " active";
    }
    // document.getElementById("inbox-tab").setAttribute("onclick", `openTab(event, 'inbox-component)`);
    // document.getElementById("chat-tab").setAttribute("onclick",`openTab(event, 'chat-component')`);

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

window.addEventListener('click', function (e) {
    if (e.target == modal) {
        modal.style.display = 'none';
    }
});