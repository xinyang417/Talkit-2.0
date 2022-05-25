"use strict";

let socket = io.connect('/');
let data = JSON.parse(sessionStorage.getItem("user"));
var room;
socket.emit('loggedin', data)

function openChatWindow(room) {
    
    if (!document.getElementById(room)) {
        document.getElementById("chat-box").innerHTML = `<div class="chat-window" id="${room}"></div>`;
        
    }
    document.getElementById("send").setAttribute("onclick", `sendMessage('${room}')`);
}
function createRoom(id, name) {
    let loggedInUser = JSON.parse(sessionStorage.getItem('user'));
    room = Date.now() + Math.random();
    room = room.toString().replace(".", "_");
    document.getElementById("friend-dName").getElementsByTagName("b")[0].innerHTML = name;
    socket.emit('create', {room: room, userId: loggedInUser.ID, withUserId: id, hostName: data.displayName});
    openChatWindow(room);
}

function sendMyMessage(chatWindowId, fromUser, message) {
    let html;
    if (data.ID == fromUser.ID) {
        html =`<div class="myBubble">
                    <div class="myMsg">
                        <p class="myText">${message}</p>
                        <img class="myPic" src="/img/${fromUser.profilePic}" />
                    </div>
                </div>`;
    } else {
        html = `<div class="userBubble">
                    <div class="userMsg">
                        <p class="userText">${message}</p>
                        <img class="userPic" src="/img/${fromUser.profilePic}" />
                    </div>
                </div>`;
    }
    
    document.getElementById(`${chatWindowId}`).insertAdjacentHTML("beforeend", html); 
}

function sendMessage(room) {
    let message = document.getElementById("msg").value;
    document.getElementById("msg").value = "";
    socket.emit('send-message', {room: room, message:message, from: data});
    sendMyMessage(room, data, message);
}

socket.on('updateUserList', (userList) => {
    let loggedInUser = JSON.parse(sessionStorage.getItem('user'));
    document.getElementById("inbox-component").innerHTML = `<ul></ul>`;
    let i = 0;
    userList.forEach(item => {
        if (loggedInUser.ID != item.ID){
            document.getElementById('inbox-component').getElementsByTagName("ul")[i].innerHTML = `<li data-id ="${item.ID}" onclick = "createRoom('${item.ID}', '${item.displayName}')">${item.displayName}</li>`;
            i++;
        }
    });
});

socket.on('invite', function(data) {
    document.getElementById("friend-dName").getElementsByTagName("b")[0].innerHTML = `${data.hostName}`;
    socket.emit("joinRoom", data)
});

socket.on('receive-message', (data) => {
    if(!document.getElementById(`${data.room}`)) {
        openChatWindow(data.room);
    }
    
    sendMyMessage(data.room, data.from, data.message)
});